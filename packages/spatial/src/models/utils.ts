/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpatialModel } from './types';
import { eSpatialModel } from './enums';
import { MODEL_REGISTRY } from './constants';

export const resolveSpatialModel = (model: eSpatialModel): SpatialModel =>
  MODEL_REGISTRY[model];
