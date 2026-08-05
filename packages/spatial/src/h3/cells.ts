/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

import { cellToLatLng, gridDisk, latLngToCell, polygonToCells } from 'h3-js';

/**
 * Converts geographic coordinates into an H3 spatial cell index.
 * @param lat Latitude of point
 * @param lng Longitude of point
 * @param res Resolution of cell to return
 * @returns H3 cell index
 */
export function toCell(lat: number, lng: number, res: number) {
  return latLngToCell(lat, lng, res);
}

/**
 * Converts an H3 cell index into geographic coordinates.
 * @param cell H3 cell index
 * @returns Latitude and longitude coordinates
 */
export function toCoordinates(cell: string) {
  return cellToLatLng(cell);
}

/**
 * Retrieves neighboring H3 cells within the specified grid radius.
 * @param cell Origin H3 cell index
 * @param radius Grid traversal radius
 * @returns Neighboring H3 cell indexes
 */
export function getNeighbors(cell: string, radius: number): string[] {
  return gridDisk(cell, radius);
}

export function viewportToCells(
  swLat: number,
  swLng: number,
  neLat: number,
  neLng: number,
  res: number,
): string[] {
  return polygonToCells(
    [
      [swLng, swLat],
      [neLng, swLat],
      [neLng, neLat],
      [swLng, neLat],
      [swLng, swLat],
    ],
    res,
    true,
  );
}

export default {
  toCell,
  toCoordinates,
  getNeighbors,
  viewportToCells,
};
