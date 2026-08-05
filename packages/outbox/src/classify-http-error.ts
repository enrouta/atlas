export type ErrorClass = 'retryable' | 'rejected';

/**
 * 4xx statuses that are really "try again", not "no": the request timed out on
 * the way (408) or was throttled (429). These clear on their own, so they queue.
 */
const RETRYABLE_CLIENT_STATUSES = new Set([408, 429]);

/** Default status reader: uses a numeric `status` field on the error, if present. */
function defaultGetStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

/**
 * Decide whether a failed send should be queued and retried, or surfaced as a
 * rejection.
 *
 * - `retryable` — the server never got to judge the request (offline, timeout,
 *   server fault, rate limit). Nothing is wrong with the payload; keep trying.
 * - `rejected` — the server judged it and said no (bad/duplicate data, auth,
 *   validation). Retrying sends the exact same thing for the exact same no.
 *
 * Anything without a definite server "no" is treated as retryable — a network
 * blip (no HTTP response at all) must never be mistaken for a rejection.
 *
 * Pass a custom `getStatus` if your errors don't expose a numeric `status`.
 */
export function classifyHttpError(
  error: unknown,
  getStatus: (error: unknown) => number | undefined = defaultGetStatus,
): ErrorClass {
  const status = getStatus(error);
  if (status === undefined) return 'retryable';
  if (status >= 500 || RETRYABLE_CLIENT_STATUSES.has(status)) return 'retryable';
  if (status >= 400) return 'rejected';
  return 'retryable';
}
