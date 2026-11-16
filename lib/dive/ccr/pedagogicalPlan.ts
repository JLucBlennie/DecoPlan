/**
 * DecoPlan – CCR : plan pédagogique en recycleur, comparable à un plan en circuit ouvert.
 *
 * Mêmes niveaux profondeur / temps que la plongée de départ, mais respirés en boucle
 * avec un diluant saisi librement et des GF propres au CCR. Pas de bail-out.
 */

import { buildDivePlanFromPlan } from '../buildDivePlan';
import { Gas } from '../gas';
import type { DivePlan } from '../types';
import type { DiveDefinition } from '../whatIf/types';
import { computeCcrRuntime } from './ccrRuntime';
import type { CcrConfig } from './types';

export interface CcrComparisonOptions {
  /** Diluant saisi (fractions O₂ / He, 0–1). */
  diluentFO2: number;
  diluentFHe: number;
  gfLow: number;
  gfHigh: number;
  setpointLowBar: number;
  setpointHighBar: number;
  switchDepthM: number;
  /** Plan de référence (circuit ouvert) : modèle et nom. */
  reference: DivePlan;
}

/** Valide la composition d'un diluant ; retourne un message d'erreur, ou null si elle est valide. */
export function diluentError(fO2: number, fHe: number): string | null {
  if (!Number.isFinite(fO2) || !Number.isFinite(fHe)) return 'Composition du diluant invalide.';
  if (fO2 < 0.05 || fO2 > 1) return 'O₂ du diluant : entre 5 et 100 %.';
  if (fHe < 0 || fHe > 0.95) return 'He du diluant : entre 0 et 95 %.';
  if (fO2 + fHe > 1 + 1e-9) return 'O₂ + He dépasse 100 %.';
  return null;
}

export function buildCcrComparisonPlan(def: DiveDefinition, options: CcrComparisonOptions): DivePlan {
  const error = diluentError(options.diluentFO2, options.diluentFHe);
  if (error) throw new Error(error);

  const diluentName = `Dil ${Math.round(options.diluentFO2 * 100)}/${Math.round(options.diluentFHe * 100)}`;
  const diluent = Gas.fromJSON({
    id: diluentName,
    name: diluentName,
    fO2: options.diluentFO2,
    fHe: options.diluentFHe,
    fN2: 1 - options.diluentFO2 - options.diluentFHe,
  });

  const config: CcrConfig = {
    diluentName: diluent.name,
    setpointLowBar: options.setpointLowBar,
    setpointHighBar: options.setpointHighBar,
    switchDepthM: options.switchDepthM,
  };

  const ccrDef: DiveDefinition = {
    ...def,
    bottomGases: [diluent],
    decoGases: [],
    bottomSegments: def.bottomSegments.map(s => ({ ...s, gasName: diluent.name })),
    gfLow: options.gfLow,
    gfHigh: options.gfHigh,
    ccr: { config, bailoutRmvLMin: 0, bailoutTank: { volumeL: 0, pressureBar: 0 } },
  };

  const { plan } = computeCcrRuntime(ccrDef, config);

  return buildDivePlanFromPlan(plan, {
    variant: options.reference.model,
    gfLow: options.gfLow,
    gfHigh: options.gfHigh,
    planName: `CCR ${diluent.name} — GF ${Math.round(options.gfLow * 100)}/${Math.round(options.gfHigh * 100)}`,
    ccr: true,
  });
}
