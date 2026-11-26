import { type CompartmentPressures } from './compartments';
import { computeDciemDive, integratePhase } from './computeDciemDive';
import type { DciemParameters, DciemResult } from './types';

/** Pas d'intégration pendant l'intervalle en surface (min) : la dynamique y est lente. */
const SURFACE_STEP_MIN = 0.5;

/** Une plongée de la paire : profondeur et temps de plongée (descente comprise). */
export type DciemDiveInput = Pick<DciemParameters, 'depthM' | 'diveTimeMin' | 'descentRateMMin'>;

export interface DciemSuccessiveParameters {
  first: DciemDiveInput;
  second: DciemDiveInput;
  surfaceIntervalMin: number;
  ascentRateMMin: number;
  ascentRateBetweenStopsMMin: number;
}

export interface DciemSuccessiveResult {
  first: DciemResult;
  /** 2e plongée partie des compartiments encore chargés par la 1re. */
  second: DciemResult;
  /** Même 2e plongée partie d'un plongeur saturé en surface (référence). */
  secondAlone: DciemResult;
}

/** Les 4 compartiments se rééquilibrent avec l'air de surface pendant `minutes`. */
export function restAtSurface(p: CompartmentPressures, minutes: number): CompartmentPressures {
  return integratePhase(p, 0, 0, minutes, SURFACE_STEP_MIN);
}

/**
 * Deux plongées DCIEM : le modèle gère les successives sans règle ajoutée, l'état
 * des compartiments à la sortie de l'eau se poursuit pendant l'intervalle surface.
 * (Les tables passent, elles, par un groupe répétitif et un facteur de répétition.)
 */
export function computeDciemSuccessive(params: DciemSuccessiveParameters): DciemSuccessiveResult {
  const { first, second, surfaceIntervalMin, ascentRateMMin, ascentRateBetweenStopsMMin } = params;
  const rates = { ascentRateMMin, ascentRateBetweenStopsMMin };

  const firstResult = computeDciemDive({ ...first, ...rates });
  const initialCompartments = restAtSurface(firstResult.endCompartments, surfaceIntervalMin);

  return {
    first: firstResult,
    second: computeDciemDive({ ...second, ...rates, initialCompartments }),
    secondAlone: computeDciemDive({ ...second, ...rates }),
  };
}
