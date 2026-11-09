/**
 * DecoPlan – Plongées successives : état tissulaire et désaturation en surface
 */

import type { Plan } from '../buhlmann';
import { Plan as BuhlmannPlan } from '../buhlmann';
import type { TissueState } from './types';

/** Fraction d'O₂ de l'air respiré pendant l'intervalle surface. */
const AIR_FO2 = 0.21;

export function captureTissues(plan: Plan): TissueState[] {
  return plan.tissues.map(t => ({ pNitrogen: t.pNitrogen, pHelium: t.pHelium }));
}

/** Impose un état tissulaire à un Plan neuf (même nombre de compartiments). */
export function loadTissues(plan: Plan, state: TissueState[]): void {
  if (state.length !== plan.tissues.length) {
    throw new Error(`État tissulaire incompatible : ${state.length} compartiments pour ${plan.tissues.length}.`);
  }
  state.forEach((s, i) => {
    plan.tissues[i].pNitrogen = s.pNitrogen;
    plan.tissues[i].pHelium = s.pHelium;
    plan.tissues[i].pTotal = s.pNitrogen + s.pHelium;
    plan.tissues[i].ceiling = 0;
  });
}

/**
 * Désaturation pendant l'intervalle surface : respiration d'air à la pression de
 * surface du Plan, pendant intervalMin. Ne modifie pas l'état fourni.
 */
export function applySurfaceInterval(
  state: TissueState[],
  intervalMin: number,
  like: Plan,
): TissueState[] {
  const scratch = new BuhlmannPlan(like.buhlmannTable, like.absPressure, like.isFreshWater);
  loadTissues(scratch, state);
  if (intervalMin > 0) {
    scratch.tissues.forEach(t => t.addFlat(0, AIR_FO2, 0, intervalMin));
  }
  return captureTissues(scratch);
}
