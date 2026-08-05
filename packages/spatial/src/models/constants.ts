/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

import { gaussianWeight } from './gaussian';
import { exponentialWeight } from './exponential';

import { eSpatialModel } from './enums';
import type { SpatialModel } from './types';

export const MODEL_REGISTRY = {
  [eSpatialModel.GAUSSIAN_WEIGHT]: gaussianWeight,
  [eSpatialModel.EXPONENTIAL_WEIGHT]: exponentialWeight,
} satisfies Record<eSpatialModel, SpatialModel>;
