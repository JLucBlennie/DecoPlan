/**
 * DecoPlan – Optimisation : plus long temps de fond qui respecte tous les critères
 *
 * Plus le temps de fond augmente, plus le gaz consommé, la déco et le 1er palier augmentent :
 * la faisabilité ne fait que se dégrader. Une recherche par dichotomie suffit (~8 calculs).
 */

import { definitionFromPlongee, type DiveSettings } from '../whatIf/definitionFromPlongee';
import { candidatePlongee } from './buildPlongee';
import { evaluateBottomTime } from './evaluateBottomTime';
import type { BottomTimeEvaluation, OptimizerCriteria, OptimizerResult } from './types';

const MIN_BOTTOM_TIME_MIN = 1;
/** Limite de recherche : au-delà, on s'arrête et on l'indique. */
export const MAX_SEARCH_BOTTOM_TIME_MIN = 240;

/** Nom de la plongée créée, sans dépendre d'une langue d'affichage. */
export function optimizedName(c: OptimizerCriteria, bottomTimeMin: number): string {
  return `${c.depthM} m / ${bottomTimeMin} min (${c.bottomGas.name})`;
}

export function findMaxBottomTime(criteria: OptimizerCriteria, settings: DiveSettings): OptimizerResult {
  const evaluateAt = (t: number): BottomTimeEvaluation => {
    const plongee = candidatePlongee(criteria, t, optimizedName(criteria, t));
    return evaluateBottomTime(criteria, t, definitionFromPlongee(plongee, settings));
  };
  const resultFor = (best: BottomTimeEvaluation, limiting: OptimizerResult['limiting'], feasible: boolean): OptimizerResult => ({
    feasible, evaluation: best, limiting,
    plongee: candidatePlongee(criteria, best.bottomTimeMin, optimizedName(criteria, best.bottomTimeMin)),
  });

  const minimum = evaluateAt(MIN_BOTTOM_TIME_MIN);
  if (minimum.violations.length > 0) return resultFor(minimum, minimum.violations, false);

  const cap = evaluateAt(MAX_SEARCH_BOTTOM_TIME_MIN);
  if (cap.violations.length === 0) return resultFor(cap, [{ kind: 'search-cap' }], true);

  // Invariant : `ok` est faisable, `ko` ne l'est pas.
  let ok = MIN_BOTTOM_TIME_MIN;
  let ko = MAX_SEARCH_BOTTOM_TIME_MIN;
  let okEval = minimum;
  let koEval = cap;
  while (ko - ok > 1) {
    const mid = Math.floor((ok + ko) / 2);
    const e = evaluateAt(mid);
    if (e.violations.length === 0) { ok = mid; okEval = e; } else { ko = mid; koEval = e; }
  }
  return resultFor(okEval, koEval.violations, true);
}
