# @enrouta/outbox

A **framework-agnostic offline send queue** (the "outbox" pattern). Persist
pending submissions, retry them with backoff, and classify failures as
*retryable* vs *rejected* — bring your own **storage** and **transport**.

No React, no React Native, no HTTP client baked in. Wire it to `AsyncStorage` +
`fetch`, `localStorage` + `axios`, or anything else.

## Install

```bash
npm install @enrouta/outbox
```

## Usage

```ts
import { createOutbox } from '@enrouta/outbox';

const outbox = createOutbox<MyPayload, MyResult>({
  storage: {
    load: () => AsyncStorage.getItem('outbox'),
    save: (s) => AsyncStorage.setItem('outbox', s),
    clear: () => AsyncStorage.removeItem('outbox'),
  },
  send: (payload) => api.post('/things', payload),
  onChange: (items) => setState(items),        // drive your UI
  onResult: (e) => track(`report_${e.kind}`),  // analytics hook
});

await outbox.hydrate(); // restore persisted queue, flush pending
outbox.start();         // background retry loop

// timeout path — adopt the in-flight request instead of re-sending:
const id = outbox.adopt(payload, inFlightPromise);
// failure path — the request already died, queue a fresh send:
outbox.enqueue(payload);
```

The happy path (a send that succeeds in-flow) never touches the queue — the
outbox only holds what you *left with*.

## Error classification

```ts
import { classifyHttpError } from '@enrouta/outbox';

classifyHttpError(err);                      // reads err.status by default
classifyHttpError(err, (e) => e.response?.status); // custom status reader
```

`5xx`, `408`, `429`, and no-response → `retryable`; other `4xx` → `rejected`.

## License

[MIT](../../LICENSE) © EnRouta
