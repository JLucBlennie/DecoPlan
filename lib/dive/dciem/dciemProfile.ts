import { getMN90DiveParameters } from '../mn90';
import type { DivePlan, MN90Profile } from '../types';
import { computeDciemDive } from './computeDciemDive';
import type { DciemResult } from './types';

/** Résultat DCIEM au format du profil MN90, pour être tracé par les mêmes composants. */
export function dciemResultToProfile(result: DciemResult): MN90Profile {
  return {
    maxDepthM: result.depthM,
    bottomTimeMin: result.diveTimeMin,
    stops: result.stops,
    totalAscentTimeMin: result.totalAscentTimeMin,
  };
}

/**
 * Profil « modèle DCIEM calculé » pour un plan de plongée.
 *
 * Même convention que MN90 : profondeur maximale + temps de plongée depuis la
 * surface (descente comprise), lus sur le profil saisi (avant décompression).
 * Le calcul DCIEM utilise les vitesses de descente et de remontée de
 * l'utilisateur ; ce n'est PAS une lecture de table.
 */
export function getDciemProfile(
  plan: DivePlan,
  descentRateMMin: number,
  ascentRateMMin: number,
  ascentRateBetweenStopsMMin: number,
): MN90Profile | undefined {
  const { maxDepthM, diveTimeMin } = getMN90DiveParameters(plan);
  if (maxDepthM <= 0 || diveTimeMin <= 0) return undefined;

  return dciemResultToProfile(computeDciemDive({
    depthM: maxDepthM,
    diveTimeMin,
    descentRateMMin,
    ascentRateMMin,
    ascentRateBetweenStopsMMin,
  }));
}
