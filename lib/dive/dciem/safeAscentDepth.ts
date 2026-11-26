import { SEA_LEVEL_MSW, SUPERSATURATION_OFF, SUPERSATURATION_R } from './constants';
import type { CompartmentPressures } from './compartments';

/**
 * Profondeur de remontée sûre (SAD, msw), équation (6) du rapport 84-R-44 :
 *   SAD = Pt/R − OFF − Psl
 * calculée pour les compartiments 1 et 2 ; on retient la plus profonde.
 * Valeur ≤ 0 : la remontée en surface est permise.
 */
export function safeAscentDepth(p: CompartmentPressures): number {
  let sad = -Infinity;
  for (let i = 0; i < SUPERSATURATION_R.length; i++) {
    sad = Math.max(sad, p[i] / SUPERSATURATION_R[i] - SUPERSATURATION_OFF[i] - SEA_LEVEL_MSW);
  }
  return sad;
}
