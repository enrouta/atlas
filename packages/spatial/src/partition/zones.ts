/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

import { cellsToMultiPolygon, gridDisk } from 'h3-js';
import type { MultiPolygon, Polygon, Position } from 'geojson';

/**
 * Turns a set of risk-bearing H3 cells into a strict spatial partition of
 * coherent zones: every cell belongs to exactly one zone, zones never overlap,
 * and a zone boundary never cuts through a cell. Pipeline: bucket (by level) ->
 * merge (adjacent same-level cells into connected components) -> union (the
 * polygon of each component's complete cells). Pure geometry/topology over H3.
 */

export type RiskCell = {
  h3Index: string;
  risk: number;
};

export type RiskZone<Level extends string = string> = {
  level: Level;
  /** Mean risk of the zone's member cells. */
  risk: number;
  geometry: Polygon | MultiPolygon;
};

/**
 * Builds the zone partition from risk cells.
 *
 * @param cells    Risk-bearing H3 cells (already thresholded upstream).
 * @param classify Maps a cell's risk to its level, or null to exclude it.
 */
export function buildRiskZones<Level extends string>(
  cells: RiskCell[],
  classify: (risk: number) => Level | null,
): RiskZone<Level>[] {
  // 1. bucket — group cells by their single, deterministic level.
  const byLevel = new Map<Level, RiskCell[]>();
  for (const cell of cells) {
    const level = classify(cell.risk);
    if (level === null) continue;
    const bucket = byLevel.get(level);
    if (bucket) bucket.push(cell);
    else byLevel.set(level, [cell]);
  }

  const zones: RiskZone<Level>[] = [];
  for (const [level, levelCells] of byLevel) {
    // 2. merge — split each level into edge-connected components.
    for (const component of connectedComponents(levelCells)) {
      // 3. union — derive the polygon from the complete cells.
      zones.push({
        level,
        risk: mean(component.map((cell) => cell.risk)),
        geometry: cellsToGeometry(component.map((cell) => cell.h3Index)),
      });
    }
  }

  return zones;
}

/**
 * Groups cells into connected components using H3 edge adjacency. Two cells are
 * connected when one is in the other's immediate ring (gridDisk radius 1), so a
 * component is a contiguous blob of same-level cells.
 */
function connectedComponents(cells: RiskCell[]): RiskCell[][] {
  const byIndex = new Map(cells.map((cell) => [cell.h3Index, cell]));
  const unvisited = new Set(byIndex.keys());
  const components: RiskCell[][] = [];

  for (const start of byIndex.keys()) {
    if (!unvisited.has(start)) continue;

    const component: RiskCell[] = [];
    const stack = [start];
    unvisited.delete(start);

    while (stack.length) {
      const current = stack.pop()!;
      component.push(byIndex.get(current)!);

      for (const neighbor of gridDisk(current, 1)) {
        if (unvisited.has(neighbor)) {
          unvisited.delete(neighbor);
          stack.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

/**
 * Unions a set of complete H3 cells into a GeoJSON polygon. h3 returns each
 * polygon as [outerLoop, ...holes] of [lng, lat] pairs; we normalize ring
 * winding to RFC 7946 (exterior CCW, holes CW) so the geometry is valid and
 * renders predictably.
 */
function cellsToGeometry(cellIds: string[]): Polygon | MultiPolygon {
  const polygons = cellsToMultiPolygon(cellIds, true) as Position[][][];
  const normalized = polygons.map(normalizeWinding);

  return normalized.length === 1
    ? { type: 'Polygon', coordinates: normalized[0] }
    : { type: 'MultiPolygon', coordinates: normalized };
}

/** Enforces exterior ring counter-clockwise and hole rings clockwise. */
function normalizeWinding(rings: Position[][]): Position[][] {
  return rings.map((ring, index) => {
    const isExterior = index === 0;
    const isClockwise = signedArea(ring) < 0;
    const wrongWay = isExterior ? isClockwise : !isClockwise;
    return wrongWay ? [...ring].reverse() : ring;
  });
}

/** Shoelace signed area; positive when the ring is counter-clockwise. */
function signedArea(ring: Position[]): number {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}
