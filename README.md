# Atlas

> Building blocks for spatial and offline-first applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/enrouta/atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/enrouta/atlas/actions/workflows/ci.yml)

Atlas is a collection of composable, framework-agnostic packages for building spatial and offline-first applications. Its packages provide building blocks for spatial indexing, computation, classification, visualization, and reliable data handling in environments where connectivity cannot be assumed.

Each package is designed to stand on its own or work seamlessly with the others, so you can adopt only what you need.

## Packages

| Package                                          | Version                                                                                                               | Description                                                 |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`@enrouta/types`](packages/types)               | [![npm](https://img.shields.io/npm/v/@enrouta/types.svg)](https://www.npmjs.com/package/@enrouta/types)               | Shared TypeScript types and domain contracts                |
| [`@enrouta/spatial`](packages/spatial)           | [![npm](https://img.shields.io/npm/v/@enrouta/spatial.svg)](https://www.npmjs.com/package/@enrouta/spatial)           | Spatial primitives and H3-based computation                 |
| [`@enrouta/spatial-viz`](packages/spatial-viz)   | [![npm](https://img.shields.io/npm/v/@enrouta/spatial-viz.svg)](https://www.npmjs.com/package/@enrouta/spatial-viz)   | Visualization primitives for rendering spatial data         |
| [`@enrouta/outbox`](packages/outbox)             | [![npm](https://img.shields.io/npm/v/@enrouta/outbox.svg)](https://www.npmjs.com/package/@enrouta/outbox)             | Offline-first queue for persisting and retrying submissions |
| [`@enrouta/outbox-react`](packages/outbox-react) | [![npm](https://img.shields.io/npm/v/@enrouta/outbox-react.svg)](https://www.npmjs.com/package/@enrouta/outbox-react) | React bindings for the outbox                               |

## Getting started

Each package is published independently on npm and can be installed on its own:

```bash
pnpm add @enrouta/spatial
```

See each package's README for usage and API details.

## Requirements

- Node.js 24+
- pnpm 9+

## Development

This is a pnpm monorepo. To work on it locally:

```bash
pnpm install
pnpm build
pnpm typecheck
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before
opening a pull request — it covers the workflow, tests, and how releases are
handled. New contributors may want to start with issues labelled
[`good first issue`](https://github.com/enrouta/atlas/labels/good%20first%20issue).

By contributing, you agree to the terms of the [Contributor License Agreement](CLA.md).

## License

Atlas is licensed under the [MIT License](https://opensource.org/licenses/MIT),
with the exception of [`@enrouta/spatial`](packages/spatial), which is licensed
under [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) for its patent grant.

This project also depends on external libraries that may use different
open-source licenses. For the terms that apply to each package, see the
`LICENSE` file within that package.

If you are contributing documentation or source changes, please ensure your
additions comply with the applicable license.

© Mansfarroll González Yaquier
