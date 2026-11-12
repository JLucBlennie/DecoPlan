/**
 * DecoPlan – CCR : chargement tissulaire en circuit fermé.
 *
 * Pour un segment à set point constant (et sans croiser la profondeur de
 * crossover — voir segmentSplit), l'inerte inspiré reste linéaire en profondeur :
 *   pInerte(z) = (Pamb(z) − PH₂O − SP) × part_gaz
 * Schreiner reste donc valable.
 */

import type { BuhlmannTissue } from '../buhlmann';
import {
  depthInMetersToBars,
  depthChangeInBarsPerMinute,
  schreinerEquation,
  LUNG_VAPOUR_PRESSURE_BAR,
} from '../physics';
import { crossoverDepth, type InertShares } from './inspiredGas';

/**
 * Charge un tissu sur un segment CCR. Le segment ne doit pas traverser le
 * crossover (utiliser splitSegmentAtDepths avec crossoverDepth).
 * @returns variation de charge totale du tissu.
 */
export function addCcrDepthChange(
  tissue: BuhlmannTissue,
  startDepth: number,
  endDepth: number,
  time: number,
  setpointBar: number,
  shares: InertShares,
): number {
  const fresh = tissue.isFreshWater;
  const crossover = crossoverDepth(setpointBar, fresh);
  const mid = (startDepth + endDepth) / 2;

  let inertStart = 0;
  let inertRate = 0;
  if (mid > crossover) {
    inertStart = Math.max(
      0,
      depthInMetersToBars(startDepth, fresh) - LUNG_VAPOUR_PRESSURE_BAR - setpointBar,
    );
    inertRate = time > 0 ? depthChangeInBarsPerMinute(startDepth, endDepth, time, fresh) : 0;
  }

  const prevTotal = tissue.pTotal;
  tissue.pNitrogen = schreinerEquation(
    tissue.pNitrogen, inertStart * shares.n2, time, tissue.n2HalfTime, inertRate * shares.n2,
  );
  tissue.pHelium = schreinerEquation(
    tissue.pHelium, inertStart * shares.he, time, tissue.heHalfTime, inertRate * shares.he,
  );
  tissue.pTotal = tissue.pNitrogen + tissue.pHelium;
  return tissue.pTotal - prevTotal;
}
