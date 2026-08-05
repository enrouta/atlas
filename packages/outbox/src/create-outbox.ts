import { classifyHttpError, type ErrorClass } from './classify-http-error';

/**
 * - `pending` — queued, will be (re)tried.
 * - `rejected` — the transport judged it and said no. Terminal; the host decides
 *   whether to notify and discard.
 */
export type OutboxStatus = 'pending' | 'rejected';

export interface OutboxItem<T> {
  /** Local id (not the server's) — stable key for discard/retry and for UI. */
  id: string;
  payload: T;
  status: OutboxStatus;
  /** How many send attempts have failed so far. */
  attempts: number;
  /** When it entered the queue (epoch ms). */
  queuedAt: number;
  /** Last failure message, for a rejected item's notice. */
  lastError?: string;
}

/** Persistence adapter — bring your own (AsyncStorage, localStorage, etc.). */
export interface OutboxStorage {
  load(): Promise<string | null>;
  save(data: string): Promise<void>;
  clear(): Promise<void>;
}

export interface OutboxResult<T> {
  kind: 'recovered' | 'rejected';
  item: OutboxItem<T>;
}

export interface OutboxConfig<T, R> {
  /** Where the pending queue is persisted. */
  storage: OutboxStorage;
  /** The transport — the actual send (e.g. an HTTP POST). */
  send: (payload: T) => Promise<R>;
  /** How a failed send is classified. Defaults to {@link classifyHttpError}. */
  classifyError?: (error: unknown) => ErrorClass;
  /** Background retry cadence in ms. Default 15000. */
  retryIntervalMs?: number;
  /** Called whenever the queue changes — drive your UI from here. */
  onChange?: (items: OutboxItem<T>[]) => void;
  /** Called on a terminal queue outcome — hook analytics here. */
  onResult?: (result: OutboxResult<T>) => void;
  /** Clock, for testability. Default `Date.now`. */
  now?: () => number;
  /** Id generator, for testability. */
  id?: () => string;
}

export interface Outbox<T, R> {
  /** Load the persisted queue, then flush pending items. Call once on startup. */
  hydrate(): Promise<void>;
  /** Failure path: the prior request died — queue and retry with a fresh send. */
  enqueue(payload: T): string;
  /** Timeout path: adopt an in-flight promise instead of starting a new send. */
  adopt(payload: T, inFlight: Promise<R>): string;
  /** Drop an item (host dismiss, or discard on reject). */
  discard(id: string): void;
  /** Force an immediate retry of one pending item. */
  retry(id: string): void;
  /** Try every pending item now — call on reconnect or foreground. */
  flush(): void;
  /** Start the background retry timer. */
  start(): void;
  /** Stop the background retry timer. */
  stop(): void;
  /** Current queue snapshot. */
  getItems(): OutboxItem<T>[];
}

const DEFAULT_RETRY_INTERVAL_MS = 15_000;

function defaultId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Framework-agnostic offline send queue (the "outbox" pattern). The happy path —
 * a send that succeeds in-flow — never touches the queue; the host awaits its own
 * `send` and shows success. The outbox only holds what the host *left with* —
 * adopted on timeout or enqueued on a retryable failure — and keeps retrying,
 * persisting pending items so they survive a cold restart.
 */
export function createOutbox<T, R>(config: OutboxConfig<T, R>): Outbox<T, R> {
  const {
    storage,
    send,
    classifyError = classifyHttpError,
    retryIntervalMs = DEFAULT_RETRY_INTERVAL_MS,
    onChange,
    onResult,
    now = () => Date.now(),
    id = defaultId,
  } = config;

  let items: OutboxItem<T>[] = [];
  // Ids with a send in flight — so the retry loop, adopt, and enqueue never
  // double-send the same item.
  const sending = new Set<string>();
  // Gates persistence so the empty initial state can't overwrite stored items
  // before hydration reads them.
  let hydrated = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  function persist(): void {
    if (!hydrated) return;
    const pending = items.filter((i) => i.status === 'pending');
    void (pending.length
      ? storage.save(JSON.stringify(pending))
      : storage.clear());
  }

  function setItems(next: OutboxItem<T>[]): void {
    items = next;
    persist();
    onChange?.(items);
  }

  async function run(item: OutboxItem<T>, inFlight?: Promise<R>): Promise<void> {
    if (sending.has(item.id)) return;
    sending.add(item.id);
    try {
      await (inFlight ?? send(item.payload));
      setItems(items.filter((i) => i.id !== item.id)); // landed → leave the queue
      onResult?.({ kind: 'recovered', item });
    } catch (error) {
      const klass = classifyError(error);
      const message = error instanceof Error ? error.message : 'unknown';
      const status: OutboxStatus = klass === 'rejected' ? 'rejected' : 'pending';
      setItems(
        items.map((i) =>
          i.id === item.id
            ? { ...i, status, attempts: i.attempts + 1, lastError: message }
            : i,
        ),
      );
      if (klass === 'rejected') {
        const rejected = items.find((i) => i.id === item.id);
        if (rejected) onResult?.({ kind: 'rejected', item: rejected });
      }
    } finally {
      sending.delete(item.id);
    }
  }

  function queueItem(payload: T): OutboxItem<T> {
    const item: OutboxItem<T> = {
      id: id(),
      payload,
      status: 'pending',
      attempts: 0,
      queuedAt: now(),
    };
    setItems([item, ...items]);
    return item;
  }

  function flush(): void {
    for (const item of items) {
      if (item.status === 'pending') void run(item);
    }
  }

  async function hydrate(): Promise<void> {
    try {
      const raw = await storage.load();
      if (raw) {
        const saved = JSON.parse(raw) as OutboxItem<T>[];
        const pending = saved.filter((i) => i.status === 'pending');
        if (pending.length) {
          items = pending;
          onChange?.(items);
        }
      }
    } catch {
      // Corrupt/unavailable storage: start empty rather than throw.
    } finally {
      hydrated = true;
    }
    flush();
  }

  function enqueue(payload: T): string {
    const item = queueItem(payload);
    void run(item);
    return item.id;
  }

  function adopt(payload: T, inFlight: Promise<R>): string {
    const item = queueItem(payload);
    void run(item, inFlight);
    return item.id;
  }

  function discard(itemId: string): void {
    setItems(items.filter((i) => i.id !== itemId));
  }

  function retry(itemId: string): void {
    const item = items.find((i) => i.id === itemId);
    if (item) void run(item);
  }

  function start(): void {
    if (timer) return;
    timer = setInterval(flush, retryIntervalMs);
  }

  function stop(): void {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function getItems(): OutboxItem<T>[] {
    return items;
  }

  return { hydrate, enqueue, adopt, discard, retry, flush, start, stop, getItems };
}
