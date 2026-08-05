/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Computes a Gaussian influence weight based on the distance from an origin point.
 * @param distance Distance from the origin point
 * @param sigma Standard deviation controlling the spread of influence. A value of 0 produces
 * a degenerate distribution where only the origin has influence.
 * @returns Gaussian weight in the range [0, 1]. Returns 1 if distance and sigma are both 0.
 */
export function gaussianWeight(distance: number, sigma: number): number {
  if (sigma === 0) return distance === 0 ? 1 : 0;

  return Math.exp(-(distance ** 2) / (2 * sigma ** 2));
}
