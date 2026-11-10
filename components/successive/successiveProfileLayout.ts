/**
 * DecoPlan – Écran « Successive » : disposition du graphique des deux profils
 *
 * L'intervalle surface peut durer des heures face à des plongées de quelques dizaines
 * de minutes : il est dessiné comme une coupure de largeur fixe, pas à l'échelle.
 * L'axe « virtuel » (minutes) place la plongée 1, la coupure, puis la plongée 2.
 */

import type { ProfilePoint } from '../../lib/dive';

export interface ProfileLayout {
  /** Longueur de la zone plongée 1, de la coupure, de la zone plongée 2, et de l'axe (min virtuelles). */
  firstLenMin: number;
  gapLenMin: number;
  secondLenMin: number;
  totalLenMin: number;
  /** Début de la plongée 2 sur l'axe virtuel. */
  secondStartMin: number;
}

const MIN_GAP_MIN = 6;
const GAP_SHARE = 0.12;

/**
 * @param firstEndMin   fin de la plongée 1 (tracés Bühlmann et MN90 confondus)
 * @param secondEndMin  fin de la plongée 2
 * @param overlayEndMin fin d'un tracé qui part de l'instant 0 et couvre tout (consécutives MN90)
 */
export function computeProfileLayout(firstEndMin: number, secondEndMin: number, overlayEndMin = 0): ProfileLayout {
  const gapLenMin = Math.max(MIN_GAP_MIN, GAP_SHARE * (firstEndMin + secondEndMin));
  const secondStartMin = firstEndMin + gapLenMin;
  return {
    firstLenMin: firstEndMin,
    gapLenMin,
    secondLenMin: secondEndMin,
    secondStartMin,
    totalLenMin: Math.max(secondStartMin + secondEndMin, overlayEndMin),
  };
}

/** Décale les points d'une plongée sur l'axe virtuel. */
export function shiftPoints(points: ProfilePoint[], offsetMin: number): ProfilePoint[] {
  return points.map(p => ({ timeMin: p.timeMin + offsetMin, depthM: p.depthM }));
}

/** Graduations du temps : 5 / 10 / 15 min selon la durée. */
export function timeTicks(lenMin: number): number[] {
  const step = lenMin <= 20 ? 5 : lenMin <= 60 ? 10 : lenMin <= 120 ? 15 : 30;
  const ticks: number[] = [];
  for (let t = step; t < lenMin; t += step) ticks.push(t);
  return ticks;
}
