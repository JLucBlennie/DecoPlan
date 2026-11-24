/**
 * DecoPlan – Optimisation : évaluation d'un temps de fond
 *
 * Calcule le runtime complet puis compare le gaz nécessaire au gaz disponible (réserve déduite),
 * la durée de déco et la profondeur du 1er palier aux limites choisies.
 */

import { blockCapacityL } from '../gasBlocks';
import { openCircuitGasNeeds } from '../whatIf/runtimeGasNeeds';
import { computeRuntimeSegments } from '../whatIf/runtime';
import { summarizeRuntime } from '../whatIf/summary';
import type { DiveDefinition } from '../whatIf/types';
import type { BlockSpec, BottomTimeEvaluation, GasBudget, LimitingFactor, OptimizerCriteria } from './types';

/** Gaz de déco utilisé sans bloc prévu : rien de disponible. */
const NO_BLOCK: BlockSpec = { volumeL: 0, pressureBar: 0, count: 0 };

function budgetOf(
  role: 'bottom' | 'deco', gasName: string, neededL: number, block: BlockSpec, reserveBar: number,
): GasBudget {
  const availableL = block.count * blockCapacityL(block, reserveBar);
  const totalVolumeL = block.count * block.volumeL;
  const usedBar = totalVolumeL > 0 ? neededL / totalVolumeL : 0;
  return {
    gasName, role, neededL, availableL,
    remainingBar: block.pressureBar - usedBar,
    exceeded: neededL > availableL,
  };
}

function violationsOf(budgets: GasBudget[], decoTimeMin: number, firstStopM: number, c: OptimizerCriteria): LimitingFactor[] {
  const out: LimitingFactor[] = [];
  for (const b of budgets) {
    if (!b.exceeded) continue;
    out.push(b.role === 'bottom' ? { kind: 'bottom-gas' } : { kind: 'deco-gas', gasName: b.gasName });
  }
  if (c.maxDecoTimeMin !== undefined && decoTimeMin > c.maxDecoTimeMin) out.push({ kind: 'deco-time' });
  if (c.maxFirstStopDepthM !== undefined && firstStopM > c.maxFirstStopDepthM) out.push({ kind: 'first-stop' });
  return out;
}

/** `definitionAt` construit la définition de calcul pour un temps de fond (voir findMaxBottomTime). */
export function evaluateBottomTime(
  criteria: OptimizerCriteria, bottomTimeMin: number, definition: DiveDefinition,
): BottomTimeEvaluation {
  const segments = computeRuntimeSegments(definition);
  const summary = summarizeRuntime(definition, segments);
  const needs = openCircuitGasNeeds(definition, segments, summary.bottomPhaseMin);

  const budgets = needs.map(n =>
    n.role === 'bottom'
      ? budgetOf('bottom', n.gasName, n.litres, criteria.bottomBlock, criteria.reserves.bottomBar)
      : budgetOf('deco', n.gasName, n.litres, criteria.decoBlocks[n.gasName] ?? NO_BLOCK, criteria.reserves.decoBar));

  return {
    bottomTimeMin, definition, summary, budgets,
    violations: violationsOf(budgets, summary.decoTimeMin, summary.firstStopDepthM, criteria),
  };
}
