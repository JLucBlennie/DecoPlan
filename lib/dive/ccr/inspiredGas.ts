/**
 * DecoPlan – CCR : gaz inspiré dans la boucle.
 *
 * ppO₂ de la boucle = min(set point, Pamb − PH₂O).
 * Gaz inerte inspiré = (Pamb − PH₂O − ppO₂ boucle), réparti N₂/He selon le diluant.
 */

import { depthInMetersToBars, barToDepthInMeters, LUNG_VAPOUR_PRESSURE_BAR } from '../physics';

export interface InertShares {
  n2: number; // part de N₂ dans l'inerte du diluant
  he: number; // part de He dans l'inerte du diluant
}

/** Répartition N₂/He de l'inerte d'un diluant. Diluant O₂ pur → 0/0. */
export function inertSharesOfDiluent(fO2: number, fHe: number): InertShares {
  const inert = 1 - fO2;
  if (inert <= 1e-9) return { n2: 0, he: 0 };
  const he = fHe / inert;
  return { n2: 1 - he, he };
}

/** ppO₂ réelle de la boucle à une profondeur donnée. */
export function loopPpO2(depth: number, setpointBar: number, isFreshWater: boolean): number {
  const alveolar = depthInMetersToBars(depth, isFreshWater) - LUNG_VAPOUR_PRESSURE_BAR;
  return Math.max(0, Math.min(setpointBar, alveolar));
}

/** Pression d'inerte totale inspirée (bar) à une profondeur et un set point donnés. */
export function inspiredInertBar(depth: number, setpointBar: number, isFreshWater: boolean): number {
  const alveolar = depthInMetersToBars(depth, isFreshWater) - LUNG_VAPOUR_PRESSURE_BAR;
  return Math.max(0, alveolar - loopPpO2(depth, setpointBar, isFreshWater));
}

/**
 * Profondeur (m) sous laquelle la boucle ne peut plus tenir le set point
 * (ppO₂ = Pamb − PH₂O, boucle en O₂ pur). ≈ 3 m pour SP 1.3.
 */
export function crossoverDepth(setpointBar: number, isFreshWater: boolean): number {
  return Math.max(0, barToDepthInMeters(setpointBar + LUNG_VAPOUR_PRESSURE_BAR, isFreshWater));
}
