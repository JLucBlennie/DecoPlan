/**
 * DecoPlan – WhatIf : calcul d'un runtime complet
 *
 * Reconstruit un Plan Bühlmann vierge à chaque appel, de sorte que les calculs
 * ne s'influencent pas (calculateDecompression() ajoute ses segments à plan.segments).
 */

import { Plan } from '../buhlmann';
import type { Segment } from '../types';
import type { DiveDefinition } from './types';

export interface RuntimeComputation {
  /** Plan complet (fond + déco), nécessaire au mode pédagogique. */
  plan: Plan;
  /** Segments de décompression seuls, tels que retournés par calculateDecompression(). */
  decoSegments: Segment[];
}

export function computeRuntime(def: DiveDefinition): RuntimeComputation {
  const plan = new Plan(def.tissueTable, def.absPressureBar, def.isFreshWater);

  def.bottomGases.forEach(gas => plan.addBottomGas(gas));
  def.decoGases.forEach(gas => plan.addDecoGas(gas));

  for (const seg of def.bottomSegments) {
    plan.addDepthChange(seg.startDepth, seg.endDepth, seg.gasName, seg.time);
  }

  const decoSegments = plan.calculateDecompression(
    false,
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
