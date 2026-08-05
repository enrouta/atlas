/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDistance } from '../proximity/distance';
import { gaussianWeight } from '../models/gaussian';

import type { InfluenceModel } from './types';

export function computeSpatialInfluence(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
  sourceWeight: number,
  spread: number,
  model: InfluenceModel = gaussianWeight,
): number {
  const distance =
    getDistance(originLat, originLng, targetLat, targetLng) / 1000;

  return sourceWeight * model(distance, spread);
}
