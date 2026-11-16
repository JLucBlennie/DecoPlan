/**
 * DecoPlan – CCR : plan pédagogique en circuit ouvert, comparable à un plan CCR de départ.
 *
 * Mêmes niveaux profondeur / temps que la plongée CCR, respirés au gaz de fond choisi,
 * avec au plus un gaz de déco, et des GF propres au circuit ouvert.
 */

import { buildDivePlanFromPlan } from '../buildDivePlan';
import type { Gas } from '../gas';
import { gasNeedsFromPlan } from '../gasNeeds';
import type { DivePlan } from '../types';
import { computeRuntime } from '../whatIf/runtime';
import type { DiveDefinition } from '../whatIf/types';

/** FO₂ minimale respirable en surface (au-dessous : gaz hypoxique, inutilisable au départ). */
const MIN_SURFACE_FO2 = 0.16;

export interface OcComparisonOptions {
  bottomGas: Gas;
  /** Un seul gaz de déco, facultatif. */
  decoGas?: Gas;
  gfLow: number;
  gfHigh: number;
  rmvFondLMin: number;
  rmvDecoLMin: number;
  /** Plan de référence (CCR) : modèle. */
  reference: DivePlan;
}

function maxDepthOf(def: DiveDefinition): number {
  return Math.max(0, ...def.bottomSegments.map(s => Math.max(s.startDepth, s.endDepth)));
}

/** Message d'erreur si le gaz ne convient pas comme gaz de fond de la plongée ; sinon null. */
export function bottomGasError(def: DiveDefinition, gas: Gas): string | null {
  if (gas.fO2 < MIN_SURFACE_FO2) return `${gas.name} est hypoxique en surface.`;
  const depth = maxDepthOf(def);
  const ppO2 = gas.ppO2AtDepth(depth, def.isFreshWater);
  if (ppO2 > def.maxBottomPpO2 + 1e-9) {
    return `${gas.name} : ppO₂ ${ppO2.toFixed(2)} bar à ${depth} m (limite ${def.maxBottomPpO2} bar).`;
  }
  return null;
}

export function buildOcComparisonPlan(def: DiveDefinition, options: OcComparisonOptions): DivePlan {
  const error = bottomGasError(def, options.bottomGas);
  if (error) throw new Error(error);

  const ocDef: DiveDefinition = {
    ...def,
    ccr: undefined,
    bottomGases: [options.bottomGas],
    decoGases: options.decoGas ? [options.decoGas] : [],
    bottomSegments: def.bottomSegments.map(s => ({ ...s, setpointBar: undefined, gasName: options.bottomGas.name })),
    gfLow: options.gfLow,
    gfHigh: options.gfHigh,
  };

  const { plan } = computeRuntime(ocDef);

  const divePlan = buildDivePlanFromPlan(plan, {
    variant: options.reference.model,
    gfLow: options.gfLow,
    gfHigh: options.gfHigh,
    planName: `OC ${options.bottomGas.name} — GF ${Math.round(options.gfLow * 100)}/${Math.round(options.gfHigh * 100)}`,
  });

  return { ...divePlan, gasNeedsL: gasNeedsFromPlan(divePlan, options.rmvFondLMin, options.rmvDecoLMin) };
}
