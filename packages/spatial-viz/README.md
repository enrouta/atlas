# @enrouta/spatial-viz

Framework-agnostic helpers to turn EnRouta risk cells into **GeoJSON** for map
rendering. No map library is assumed — feed the output to MapLibre, Mapbox,
Leaflet, deck.gl, or anything that speaks GeoJSON.

It renders risk; it never computes it. There is no neighbor, influence,
aggregation, or decay logic here — that stays with the producer of the cells.

## Install

```bash
npm install @enrouta/spatial-viz
```

## Usage

```ts
import { cellsToFeatureCollection, RISK_PALETTE } from '@enrouta/spatial-viz';

const geojson = cellsToFeatureCollection([{ cellId: '87283472bffffff', risk: 0.7 }]);
// → GeoJSON FeatureCollection<Polygon, { risk: number }>, ready for any map layer.
```

## License

[MIT](../../LICENSE) © EnRouta
