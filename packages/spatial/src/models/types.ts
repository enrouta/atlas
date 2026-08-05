/**
 * Copyright 2026 EnRouta
 * SPDX-License-Identifier: Apache-2.0
 */

/** A function that attenuates a value over time given a decay rate. Returns a factor in [0, 1]. */
export type DecayModel = (value: number, rate: number) => number;

export type SpatialModel = DecayModel;
