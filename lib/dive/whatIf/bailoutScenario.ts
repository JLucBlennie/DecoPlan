/**
 * DecoPlan – WhatIf : scénario « bail-out » d'une plongée CCR.
 */

import { computeBailout } from '../ccr/bailout';
import type { GasUsage } from '../ccr/bailoutGas';
import type { Segment } from '../types';
import { bottomSegmentsOf } from './ccrBottom';
import type { DiveDefinition } from './types';

export interface BailoutScenarioResult {
  segments: Segment[];
  gasUsage: GasUsage[];
}

/** Phase fond en boucle, puis remontée et déco en circuit ouvert sur les gaz de déco. */
export function computeBailoutScenario(def: DiveDefinition): BailoutScenarioResult {
  if (!def.ccr) throw new Error('Le bail-out ne s’applique qu’aux plongées en recycleur.');

  const tanks: Record<string, { volumeL: number; pressureBar: number }> = {};
  for (const gas of def.decoGases) tanks[gas.name] = def.ccr.bailoutTank;

  const bailout = computeBailout(def, def.ccr.config, {
    rmvLMin: def.ccr.bailoutRmvLMin,
    tanks,
  });

  return {
    segments: [...bottomSegmentsOf(def).map(s => ({ ...s })), ...bailout.segments],
    gasUsage: bailout.gasUsage,
  };
}
