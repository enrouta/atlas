/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Computes an exponential weight using a decay rate. The resulting weight decreases exponentially
 * as the input value increases.
 * @param value Non-negative input value (e.g. distance, time, magnitude)
 * @param lambda Decay rate coefficient. Higher values produce faster decay. Must be greater than 0.
 * @returns Decay weight in the range (0, 1]
 */
export function exponentialWeight(value: number, lambda: number): number {
  if (lambda <= 0) {
    throw new Error('Lambda must be greater than 0');
  }

  return Math.exp(-lambda * value);
}
