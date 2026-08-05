# @enrouta/outbox-react

React binding for [`@enrouta/outbox`](../outbox) — a **headless hook** for the
offline send queue. Works on React **and** React Native (no `react-native` or DOM
assumptions baked in).

This is the reference **adapter**: the core is framework-agnostic, this wraps it
for React. Use it as the pattern for `outbox-vue`, `outbox-svelte`, etc.

## Install

```bash
npm install @enrouta/outbox-react @enrouta/outbox react
```

## Usage

Call `useOutbox` **once** (at your app root) and share it via context — calling it
in multiple components creates multiple queues.

```tsx
import { useOutbox } from '@enrouta/outbox-react';

function OutboxProvider({ children }) {
  const outbox = useOutbox({
    storage: {
      load: () => AsyncStorage.getItem('outbox'),
      save: (s) => AsyncStorage.setItem('outbox', s),
      clear: () => AsyncStorage.removeItem('outbox'),
    },
    send: (payload) => api.post('/things', payload),
    onResult: (e) => track(`report_${e.kind}`),
  });

  // Foreground trigger — you wire it (kept out of the hook to stay cross-platform):
  useEffect(() => {
    // React Native:
    const sub = AppState.addEventListener('change', (s) => s === 'active' && outbox.flush());
    return () => sub.remove();
    // Web instead:
    // const h = () => document.visibilityState === 'visible' && outbox.flush();
    // document.addEventListener('visibilitychange', h);
    // return () => document.removeEventListener('visibilitychange', h);
  }, []);

  return <OutboxContext.Provider value={outbox}>{children}</OutboxContext.Provider>;
}
```

`useOutbox` returns `{ items, enqueue, adopt, discard, retry, flush }`. `items`
is reactive; the rest are stable.

## License

[MIT](../../LICENSE) © EnRouta
