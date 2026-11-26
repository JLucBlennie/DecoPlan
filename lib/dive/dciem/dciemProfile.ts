import { getMN90DiveParameters } from '../mn90';
import type { DivePlan, MN90Profile } from '../types';
import { computeDciemDive } from './computeDciemDive';

/**
 * Profil « modèle DCIEM calculé » pour un plan de plongée, au même format que le
 * profil MN90 afin d'être tracé et affiché par les mêmes composants.
 *
 * Même convention que MN90 : profondeur maximale + temps de plongée depuis la
 * surface (descente comprise). Le calcul DCIEM utilise les vitesses de descente
 * et de remontée de l'utilisateur ; ce n'est PAS une lecture de table.
 */
export function getDciemProfile(
  plan: DivePlan,
  descentRateMMin: number,
  ascentRateMMin: number,
  ascentRateBetweenStopsMMin: number,
): MN90Profile | undefined {
  const { maxDepthM, diveTimeMin } = getMN90DiveParameters(plan);
  if (maxDepthM <= 0 || diveTimeMin <= 0) return undefined;

  const result = computeDciemDive({
    depthM: maxDepthM,
    diveTimeMin,
    descentRateMMin,
    ascentRateMMin,
    ascentRateBetweenStopsMMin,
  });
  return {
    maxDepthM: result.depthM,
    bottomTimeMin: result.diveTimeMin,
    stops: result.stops,
    totalAscentTimeMin: result.totalAscentTimeMin,
  };
}
