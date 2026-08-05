# @enrouta/spatial

Framework-agnostic **spatial-intelligence primitives**: influence models,
propagation, aggregation, H3 utilities, proximity, and zone partitioning. Pure
building blocks — you supply the parameters, weights, and thresholds; there are
no tuned values or data here.

## Install

```bash
npm install @enrouta/spatial
```

## Usage

Import the whole surface, or just the subpath you need:

```ts
import { gaussianWeight, exponentialWeight, resolveSpatialModel } from '@enrouta/spatial/models';
import { computeSpatialInfluence } from '@enrouta/spatial/propagation';
import { sum } from '@enrouta/spatial/aggregation';
import { toCell, getNeighbors, viewportToCells } from '@enrouta/spatial/h3';
import { getDistance } from '@enrouta/spatial/proximity';
import { buildRiskZones } from '@enrouta/spatial/partition';

// ...or everything from the root:
import { computeSpatialInfluence, buildRiskZones } from '@enrouta/spatial';
```

## Subpaths

| Import | Contents |
|---|---|
| `@enrouta/spatial/models` | Weight functions (`exponentialWeight`, `gaussianWeight`), the model registry, `SpatialModel`/`DecayModel` types |
| `@enrouta/spatial/propagation` | `computeSpatialInfluence` + `InfluenceModel` |
| `@enrouta/spatial/aggregation` | `sum` |
| `@enrouta/spatial/h3` | `toCell`, `toCoordinates`, `getNeighbors`, `viewportToCells` |
| `@enrouta/spatial/proximity` | Haversine `getDistance`, `EARTH_RADIUS_METERS` |
| `@enrouta/spatial/partition` | `buildRiskZones`, `RiskCell`, `RiskZone` |

## Extending

New weight models are welcome contributions — add a function under `models/` and
register it in the model registry. The `SpatialModel` type (`(value, rate) => number`)
is all a new model needs to implement.

## License

[Apache-2.0](LICENSE) © EnRouta
