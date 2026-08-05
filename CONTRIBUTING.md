# Contributing to Atlas

Thanks for your interest in improving EnRouta's open toolkit! Bug fixes,
performance work, new adapters, better docs, and new packages in the spirit below
are all welcome.

## Scope

Atlas holds the reusable building blocks of the EnRouta platform: shared type
contracts, spatial primitives, visualization helpers, offline sync, the client
SDK, and developer tooling. If a change fits that spirit, it belongs here.

## Development

```bash
pnpm install
pnpm build       # build all packages
pnpm typecheck
```

Each package builds with [tsup](https://tsup.egoist.dev) (ESM + CJS + type
declarations). Packages live under `packages/*`; each is published to npm under
the `@enrouta` scope.

## Writing an adapter

Atlas packages follow a **core + adapter** shape: a framework-agnostic core, plus
thin adapters that bind it to a specific framework or platform.
[`@enrouta/outbox`](packages/outbox) (core) and
[`@enrouta/outbox-react`](packages/outbox-react) (adapter) are the reference pair
— copy that pattern for Vue, Svelte, Solid, or new storage backends.

Rules for a good adapter:

- **Keep the core pure.** Cores have zero framework dependencies. If you need
  React/Vue/etc., you're writing an adapter, not changing the core.
- **Framework as a `peerDependency`, never a `dependency`.** The host app already
  has it; bundling a second copy breaks things (React's "invalid hook call" is the
  classic). Add it to `devDependencies` too so the package builds in isolation.
- **No platform assumptions.** Don't import `react-native` or reach for
  `document`/`window`. Anything platform-specific — a foreground trigger, a
  storage backend — is *injected* by the consumer, so one adapter works on web
  and native.
- **Ship a small primitive.** A hook or composable that wraps the core is enough;
  let the consumer arrange their own context or state container.
- **Match the build setup.** ESM + CJS + types via tsup, `publishConfig.access`
  set to `public`, and its own `LICENSE` file.

`@enrouta/outbox-react` is ~40 lines: it creates the core once, mirrors the core's
`onChange` into framework state, runs `hydrate`/`start`/`stop` on the lifecycle,
and returns a headless hook. React is a peer; the foreground trigger is left to
the consumer. That's the whole template.

## Pull requests

- Keep changes focused — one concern per PR.
- Add or adjust tests and run `pnpm typecheck` before pushing.
- Use clear, descriptive commit messages.

## Contributor License Agreement (CLA)

By contributing, you agree to our Contributor License Agreement. It grants EnRouta
the rights to use and distribute your contributions across the project and its
products, while you retain copyright of your work. CLA signing is enforced
automatically on your first pull request. _(CLA text is being finalized.)_

## License

Contributions are accepted under each package's license — [MIT](LICENSE) for most
packages, Apache-2.0 for `@enrouta/spatial`. Check the `LICENSE` in the package
you're editing.
