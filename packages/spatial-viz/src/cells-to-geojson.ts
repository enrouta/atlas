import type { CellContext } from '@enrouta/types';
import { cellToBoundary } from 'h3-js';

/**
 * Converts risk cells into a GeoJSON FeatureCollection for rendering.
 *
 * This is intentionally the only geometry step: `cellToBoundary` turns an H3
 * index into its polygon boundary purely for drawing. No neighbor, influence,
 * aggregation, decay or resolution logic lives here — those are the producer's
 * concern, not the renderer's.
 */
export function cellsToFeatureCollection(
  cells: CellContext[],
): GeoJSON.FeatureCollection<GeoJSON.Polygon, { risk: number }> {
  return {
    type: 'FeatureCollection',
    features: cells.map((cell) => ({
      type: 'Feature',
      properties: { risk: cell.risk },
      geometry: {
        type: 'Polygon',
        // `true` returns a closed ring in GeoJSON [lng, lat] order.
        coordinates: [cellToBoundary(cell.cellId, true)],
      },
    })),
  };
}
