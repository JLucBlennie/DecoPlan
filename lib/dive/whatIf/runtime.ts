/**
 * DecoPlan – WhatIf : calcul d'un runtime complet
 *
 * Reconstruit un Plan Bühlmann vierge à chaque appel, de sorte que les calculs
 * ne s'influencent pas (calculateDecompression() ajoute ses segments à plan.segments).
 */

import { Plan } from '../buhlmann';
import type { Segment } from '../types';
import type { TissueState } from '../successive/types';
import { loadTissues } from '../successive/tissueState';
import type { DiveDefinition } from './types';

export interface RuntimeComputation {
  /** Plan complet (fond + déco), nécessaire au mode pédagogique. */
  plan: Plan;
  /** Segments de décompression seuls, tels que retournés par calculateDecompression(). */
  decoSegments: Segment[];
}

export interface RuntimeOptions {
  /** Tissus de départ (plongée successive). Par défaut : saturés en surface. */
  initialTissues?: TissueState[];
  /** Garde dans plan.tissues l'état à la sortie de l'eau (au lieu de celui en fin de fond). */
  keepEndState?: boolean;
}

export function computeRuntime(def: DiveDefinition, options: RuntimeOptions = {}): RuntimeComputation {
  const plan = new Plan(def.tissueTable, def.absPressureBar, def.isFreshWater);
  if (options.initialTissues) loadTissues(plan, options.initialTissues);

  def.bottomGases.forEach(gas => plan.addBottomGas(gas));
  def.decoGases.forEach(gas => plan.addDecoGas(gas));

  for (const seg of def.bottomSegments) {
    plan.addDepthChange(seg.startDepth, seg.endDepth, seg.gasName, seg.time);
  }

  const decoSegments = plan.calculateDecompression(
    options.keepEndState === true,
    def.gfLow,
    def.gfHigh,
    def.maxDecoPpO2,
    def.maxEndM,
    undefined,
    def.ascentRateMpm,
    def.timeStepMin,
    false,
    def.ascentRateBetweenStopsMpm,
  );

  return { plan, decoSegments };
}

/** Segments saisis + décompression calculée, dans l'ordre chronologique. */
export function computeRuntimeSegments(def: DiveDefinition): Segment[] {
  const { decoSegments } = computeRuntime(def);
  return [...def.bottomSegments.map(s => ({ ...s })), ...decoSegments];
}
