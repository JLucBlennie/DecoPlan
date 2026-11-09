/**
 * DecoPlan – Plongées successives : calcul Bühlmann des deux plongées + lecture MN90
 *
 *   plongée 1 → intervalle surface (désaturation à l'air) → plongée 2 (tissus reportés)
 *
 * Fonctions pures : chaque calcul part d'un Plan neuf.
 */

import { summarizeRuntime } from '../whatIf/summary';
import { computeRuntime } from '../whatIf/runtime';
import type { DiveDefinition } from '../whatIf/types';
import { getMN90SuccessiveProfile } from '../mn90Successive';
import { mn90ParametersFromSegments } from './mn90Params';
import { applySurfaceInterval, captureTissues } from './tissueState';
import type {
  CompartmentDesaturation, ComputedDive, IntervalSweepPoint, SuccessiveDiveInput, SuccessiveResult, TissueState,
} from './types';

function computeDive(def: DiveDefinition, initialTissues?: TissueState[], keepEndState = false) {
  const { plan, decoSegments } = computeRuntime(def, { initialTissues, keepEndState });
  const segments = [...def.bottomSegments.map(s => ({ ...s })), ...decoSegments];
  const dive: ComputedDive = { segments, summary: summarizeRuntime(def, segments) };
  return { dive, plan };
}

export function computeSuccessive(input: SuccessiveDiveInput): SuccessiveResult {
  const { first, second, surfaceIntervalMin } = input;
  if (surfaceIntervalMin < 0) throw new Error("L'intervalle surface ne peut pas être négatif.");

  const dive1 = computeDive(first, undefined, true);
  const afterDive1 = captureTissues(dive1.plan);
  const atSecondDive = applySurfaceInterval(afterDive1, surfaceIntervalMin, dive1.plan);

  const dive2 = computeDive(second, atSecondDive);
  const alone = computeDive(second);

  // Saturation en surface = limite de la désaturation pour un intervalle infini.
  const surfaceSat = applySurfaceInterval(afterDive1, 100000, dive1.plan);
  const desaturation: CompartmentDesaturation[] = dive1.plan.tissues.map((t, i) => ({
    halfTimeMin: t.n2HalfTime,
    n2AfterDive1Bar: afterDive1[i].pNitrogen,
    n2AtSecondDiveBar: atSecondDive[i].pNitrogen,
    n2SurfaceSaturationBar: surfaceSat[i].pNitrogen,
  }));

  const mn90 = getMN90SuccessiveProfile(
    mn90ParametersFromSegments(first.bottomSegments),
    mn90ParametersFromSegments(second.bottomSegments),
    surfaceIntervalMin,
    second.ascentRateMpm,
    second.ascentRateBetweenStopsMpm,
  );

  return {
    surfaceIntervalMin,
    first: dive1.dive,
    second: dive2.dive,
    secondAlone: alone.dive,
    desaturation,
    mn90,
  };
}

/** Effet de l'intervalle sur la 2e plongée, Bühlmann et MN90 côte à côte. */
export function computeIntervalSweep(
  input: Omit<SuccessiveDiveInput, 'surfaceIntervalMin'>,
  intervalsMin: number[],
): IntervalSweepPoint[] {
  return intervalsMin.map(surfaceIntervalMin => {
    const r = computeSuccessive({ ...input, surfaceIntervalMin });
    const mn90 = r.mn90.secondDive;
    return {
      surfaceIntervalMin,
      secondTtsMin: r.second.summary.ttsMin,
      secondDecoTimeMin: r.second.summary.decoTimeMin,
      mn90SecondTtsMin: mn90?.totalAscentTimeMin,
    };
  });
}
