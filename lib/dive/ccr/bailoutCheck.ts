/**
 * DecoPlan – CCR : le bail-out est-il prévu, et utilisable à la profondeur de la plongée ?
 *
 * Fonction pure, partagée par le formulaire de plongée (avertissement à la création)
 * et le calcul du bail-out (raison affichée dans « Et si ? »). La règle est celle de
 * `Plan.bestDecoGasName` : un gaz est utilisable si la profondeur est dans sa MOD
 * (à la ppO₂ max) et si son END ne dépasse pas la limite.
 */

import type { Gas } from '../gas';

export interface BailoutLimits {
  /** ppO₂ max (bar) acceptée pour respirer un gaz de bail-out. */
  maxPpO2Bar: number;
  /** END max (m). */
  maxEndM: number;
  isFreshWater: boolean;
}

export const NO_BAILOUT_GAS_MESSAGE =
  'Aucun gaz de bail-out prévu : sélectionnez au moins un gaz de déco, qui servira de bail-out.';

/** Raison pour laquelle le gaz ne peut pas être respiré à cette profondeur, sinon `undefined`. */
function unusableReason(gas: Gas, depthM: number, limits: BailoutLimits): string | undefined {
  const mod = Math.round(gas.modInMeters(limits.maxPpO2Bar, limits.isFreshWater));
  if (depthM > mod) {
    const ppO2 = gas.ppO2AtDepth(depthM, limits.isFreshWater);
    return `ppO₂ ${ppO2.toFixed(2)} bar > ${limits.maxPpO2Bar} bar, MOD ${mod} m`;
  }
  const end = Math.round(gas.endInMeters(depthM, limits.isFreshWater));
  if (end > limits.maxEndM) return `END ${end} m > ${limits.maxEndM} m`;
  return undefined;
}

/**
 * Message d'avertissement, ou `undefined` si le bail-out est possible à `depthM`.
 * Au moins un des gaz doit être respirable à cette profondeur.
 */
export function bailoutProblem(
  gases: readonly Gas[],
  depthM: number,
  limits: BailoutLimits,
): string | undefined {
  if (gases.length === 0) return NO_BAILOUT_GAS_MESSAGE;
  if (depthM <= 0) return undefined;

  const checks = gases.map(gas => ({ name: gas.name, reason: unusableReason(gas, depthM, limits) }));
  if (checks.some(c => c.reason === undefined)) return undefined;

  const detail = checks.map(c => `${c.name} (${c.reason})`).join(' ; ');
  return `Aucun gaz de bail-out respirable à ${Math.round(depthM * 10) / 10} m : ${detail}.`;
}
