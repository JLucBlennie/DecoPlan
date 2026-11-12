/**
 * DecoPlan – CCR : volumes de gaz consommés en circuit ouvert (bail-out).
 *
 * Volume (L, détendu) = RMV (L/min) × Pamb moyenne (bar) × durée (min), par gaz.
 */

import type { Segment } from '../types';
import { depthInMetersToBars } from '../physics';

export interface TankConfig {
  volumeL: number;     // volume du bloc (L)
  pressureBar: number; // pression de gonflage (bar)
}

export interface GasUsage {
  gasName: string;
  litres: number;
  /** Pression consommée dans le bloc (bar), si le bloc est connu. */
  barUsed?: number;
  /** Capacité du bloc (L détendus), si connu. */
  capacityL?: number;
  /** true si la consommation dépasse la capacité du bloc. */
  insufficient?: boolean;
}

/** Litres consommés par gaz sur des segments en circuit ouvert. */
export function gasLitresBySegments(
  segments: Segment[],
  rmvLMin: number,
  isFreshWater: boolean,
): Record<string, number> {
  const usage: Record<string, number> = {};
  for (const s of segments) {
    const pAvg =
      (depthInMetersToBars(s.startDepth, isFreshWater) +
        depthInMetersToBars(s.endDepth, isFreshWater)) / 2;
    usage[s.gasName] = (usage[s.gasName] ?? 0) + rmvLMin * pAvg * s.time;
  }
  return usage;
}

/** Compare la consommation aux blocs disponibles (si fournis). */
export function computeGasUsage(
  segments: Segment[],
  rmvLMin: number,
  isFreshWater: boolean,
  tanks: Record<string, TankConfig> = {},
): GasUsage[] {
  const litres = gasLitresBySegments(segments, rmvLMin, isFreshWater);
  return Object.entries(litres).map(([gasName, l]) => {
    const tank = tanks[gasName];
    if (!tank) return { gasName, litres: l };
    const capacityL = tank.volumeL * tank.pressureBar;
    return {
      gasName,
      litres: l,
      barUsed: l / tank.volumeL,
      capacityL,
      insufficient: l > capacityL,
    };
  });
}
