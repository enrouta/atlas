/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

import { EARTH_RADIUS_METERS } from './constants';

/**
 * Computes the geodesic distance between two geographic coordinates
 * using the Haversine formula.
 *
 * Assumes a spherical Earth with a mean radius of 6,371,000 meters.
 *
 * @param originLat - Latitude of the origin point in decimal degrees
 * @param originLng - Longitude of the origin point in decimal degrees
 * @param targetLat - Latitude of the target point in decimal degrees
 * @param targetLng - Longitude of the target point in decimal degrees
 * @returns Distance in meters between the two coordinates
 */
export function getDistance(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
): number {
  const deltaLat = ((targetLat - originLat) * Math.PI) / 180;
  const deltaLng = ((targetLng - originLng) * Math.PI) / 180;

  const originLatRad = (originLat * Math.PI) / 180;
  const targetLatRad = (targetLat * Math.PI) / 180;

  const squaredChordLength =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLatRad) *
      Math.cos(targetLatRad) *
      Math.sin(deltaLng / 2) ** 2;

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(squaredChordLength),
      Math.sqrt(1 - squaredChordLength),
    );

  return EARTH_RADIUS_METERS * angularDistance;
}
