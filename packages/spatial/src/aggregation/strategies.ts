/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Aggregates multiple influence weights using additive accumulation.
 * @param influences - Influence weights to aggregate
 * @returns Total aggregated influence
 */
export function sum(influences: number[]): number {
  return influences.reduce((total, influence) => total + influence, 0);
}
