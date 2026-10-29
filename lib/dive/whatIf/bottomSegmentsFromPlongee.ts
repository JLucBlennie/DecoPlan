/**
 * DecoPlan – WhatIf : conversion des paliers saisis en segments explicites
 */

import type { Segment } from '../types';

export interface TransitionRates {
  /** Vitesse de descente (m/min), depuis les préférences. */
  descentRateMMin: number;
  /** Vitesse de remontée (m/min), depuis les préférences. */
  ascentRateMMin: number;
}

/**
 * Chaque entrée de `Plongee.segments` est un « niveau » : profondeur cible
 * (endDepth) + temps total à ce niveau, TRANSITION COMPRISE (convention MN90).
 *
 * Cette fonction insère la transition depuis la profondeur précédente
 * (descente ou remontée selon le sens), puis le niveau plat pour le temps
 * restant. Les segments obtenus peuvent être injectés tels quels dans un Plan.
 *
 * Si le temps saisi est inférieur à la transition, il n'y a pas de niveau
 * plat : la transition garde sa durée réelle.
 */
export function expandPlongeeSegments(levels: Segment[], rates: TransitionRates): Segment[] {
  const result: Segment[] = [];
  let currentDepth = 0;

  for (const level of levels) {
    const targetDepth = level.endDepth;
    const rate = targetDepth > currentDepth ? rates.descentRateMMin : rates.ascentRateMMin;
    const transitionTime = targetDepth !== currentDepth
      ? Math.abs(targetDepth - currentDepth) / rate
      : 0;
    const flatTime = Math.max(0, level.time - transitionTime);

    if (transitionTime > 0) {
      result.push({
        startDepth: currentDepth,
        endDepth: targetDepth,
        gasName: level.gasName,
        time: transitionTime,
      });
    }
    if (flatTime > 0) {
      result.push({
        startDepth: targetDepth,
        endDepth: targetDepth,
        gasName: level.gasName,
        time: flatTime,
      });
    }
    currentDepth = targetDepth;
  }

  return result;
}
