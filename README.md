# Atlas

Open-source packages for **EnRouta** — the spatial-intelligence layer for urban
mobility safety.

Atlas holds the reusable, non-proprietary building blocks of the EnRouta
platform: shared type contracts, spatial primitives, and client tooling. The
tuned risk models, calibration, and data that power the product stay in
EnRouta's private services — Atlas is the open toolkit around them.

## Packages

| Package | Description |
|---|---|
| [`@enrouta/types`](packages/types) | Shared domain contracts (enums, DTOs, response shapes) |

_More packages (spatial primitives, offline outbox, client SDK) are being
extracted._

## Development

```bash
pnpm install
pnpm build       # build all packages
pnpm typecheck
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Contributions require signing our CLA.

## License

[MIT](LICENSE) © EnRouta
