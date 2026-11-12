/**
 * DecoPlan – CCR : calcul du runtime en boucle (set points + déco CCR).
 */

import { Plan, type Plan as PlanType } from '../buhlmann';
import type { Segment } from '../types';
import type { DiveDefinition } from '../whatIf/types';
import { applySetpoints } from './setpointProfile';
import type { CcrConfig } from './types';

export interface CcrRuntimeComputation {
  plan: PlanType;
  /** Profil saisi, converti en segments CCR (avec set points). */
  bottomSegments: Segment[];
  /** Décompression calculée, en boucle au set point haut. */
  decoSegments: Segment[];
}

/** Construit un Plan chargé avec la phase fond CCR (sans déco). */
export function buildCcrBottomPlan(
  def: DiveDefinition,
  cfg: CcrConfig,
): { plan: Plan; bottomSegments: Segment[] } {
  const plan = new Plan(def.tissueTable, def.absPressureBar, def.isFreshWater);
  const diluent = [...def.bottomGases, ...def.decoGases].find(g => g.name === cfg.diluentName);
  if (!diluent) {
    throw new Error(`Diluant "${cfg.diluentName}" introuvable parmi les gaz de la plongée.`);
  }
  plan.addBottomGas(diluent);

  const bottomSegments = applySetpoints(def.bottomSegments, cfg);
  for (const s of bottomSegments) {
    plan.addDepthChange(s.startDepth, s.endDepth, s.gasName, s.time, s.setpointBar);
  }
  return { plan, bottomSegments };
}

export function computeCcrRuntime(
  def: DiveDefinition,
  cfg: CcrConfig,
  options: { keepEndState?: boolean } = {},
): CcrRuntimeComputation {
  const { plan, bottomSegments } = buildCcrBottomPlan(def, cfg);

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
    { setpointBar: cfg.setpointHighBar, diluentName: cfg.diluentName },
  );

  return { plan, bottomSegments, decoSegments };
}
