import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createOutbox,
  classifyHttpError,
  type OutboxConfig,
  type OutboxItem,
} from '@enrouta/outbox';

export interface UseOutboxResult<T, R> {
  /** Reactive snapshot of the queue — re-renders when it changes. */
  items: OutboxItem<T>[];
  enqueue: (payload: T) => string;
  adopt: (payload: T, inFlight: Promise<R>) => string;
  discard: (id: string) => void;
  retry: (id: string) => void;
  /** Try every pending item now — call from your own foreground trigger. */
  flush: () => void;
}

/**
 * React binding for {@link createOutbox}: creates a single outbox instance, keeps
 * a reactive snapshot of its queue, and manages its lifecycle (hydrate + start on
 * mount, stop on unmount).
 *
 * Call this ONCE — e.g. in a provider at your app root — and share the result via
 * context. Calling it in multiple components would create multiple independent
 * queues.
 *
 * Wire a foreground trigger yourself by calling `flush()` (React Native:
 * `AppState`; web: `visibilitychange`). It's intentionally left out so this stays
 * platform-agnostic and needs only `react` as a peer.
 */
export function useOutbox<T, R>(
  config: OutboxConfig<T, R>,
): UseOutboxResult<T, R> {
  const [items, setItems] = useState<OutboxItem<T>[]>([]);

  // The config may be an inline object recreated each render. Keep the latest in
  // a ref so the single outbox instance always calls the current
  // send/onResult/storage without being re-created.
  const configRef = useRef(config);
  configRef.current = config;

  const outbox = useMemo(() => {
    const initial = configRef.current;
    return createOutbox<T, R>({
      storage: {
        load: () => configRef.current.storage.load(),
        save: (s) => configRef.current.storage.save(s),
        clear: () => configRef.current.storage.clear(),
      },
      send: (payload) => configRef.current.send(payload),
      classifyError: (error) =>
        (configRef.current.classifyError ?? classifyHttpError)(error),
      onChange: setItems,
      onResult: (result) => configRef.current.onResult?.(result),
      // Config-time constants — safe to read once.
      retryIntervalMs: initial.retryIntervalMs,
      now: initial.now,
      id: initial.id,
    });
    // Create exactly once; the ref keeps callbacks fresh.
  }, []);

  useEffect(() => {
    void outbox.hydrate();
    outbox.start();
    return () => outbox.stop();
  }, [outbox]);

  return {
    items,
    enqueue: outbox.enqueue,
    adopt: outbox.adopt,
    discard: outbox.discard,
    retry: outbox.retry,
    flush: outbox.flush,
  };
}
