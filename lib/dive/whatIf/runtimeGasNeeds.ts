/**
 * DecoPlan – WhatIf : gaz nécessaires pour aller au bout d'un runtime, et blocs conseillés.
 *
 * Circuit ouvert : litres détendus = RMV × Pamb moyenne × durée, par gaz. RMV fond pendant la
 * phase saisie (descente + fond), RMV déco ensuite. Les segments en boucle (setpoint) ne
 * consomment pas de gaz de circuit ouvert. Bail-out : consommation déjà calculée par le scénario.
 */

import { BAILOUT_BLOCKS, BOTTOM_BLOCKS, DECO_BLOCKS, bestSuggestion, suggestAll } from '../gasBlocks';
import type { BlockSize } from '../gasBlocks';
import { gasLitresBySegments } from '../ccr/bailoutGas';
import type { Segment } from '../types';
import type { DiveDefinition, RuntimeGasNeed, RuntimeGasRole, WhatIfRuntime } from './types';

const EPSILON_MIN = 1e-6;

function toNeed(gasName: string, role: RuntimeGasRole, litres: number, blocks: readonly BlockSize[]): RuntimeGasNeed {
  const options = suggestAll(litres, blocks);
  return { gasName, role, litres, options, best: bestSuggestion(options) ?? options[0] };
}

/** Segments en circuit ouvert, coupés entre phase fond (RMV fond) et remontée/déco (RMV déco). */
function splitByPhase(segments: Segment[], bottomPhaseMin: number): { bottom: Segment[]; deco: Segment[] } {
  const bottom: Segment[] = [];
  const deco: Segment[] = [];
  let elapsed = 0;
  for (const s of segments) {
    (elapsed < bottomPhaseMin - EPSILON_MIN ? bottom : deco).push(s);
    elapsed += s.time;
  }
  return { bottom, deco };
}

/** Besoins en gaz de circuit ouvert d'un runtime ; vide si les RMV de la définition sont inconnus. */
export function openCircuitGasNeeds(
  def: DiveDefinition,
  segments: Segment[],
  bottomPhaseMin: number,
): RuntimeGasNeed[] {
  if (!def.rmv) return [];
  const open = segments.filter(s => s.setpointBar === undefined);
  const { bottom, deco } = splitByPhase(open, bottomPhaseMin);
  const fond = gasLitresBySegments(bottom, def.rmv.fondLMin, def.isFreshWater);
  const decoL = gasLitresBySegments(deco, def.rmv.decoLMin, def.isFreshWater);

  const litres = new Map<string, number>();
  for (const [name, l] of [...Object.entries(fond), ...Object.entries(decoL)]) {
    litres.set(name, (litres.get(name) ?? 0) + l);
  }

  const bottomNames = new Set(def.bottomGases.map(g => g.name));
  return [...litres.entries()].map(([name, l]) =>
    bottomNames.has(name)
      ? toNeed(name, 'bottom', l, BOTTOM_BLOCKS)
      : toNeed(name, 'deco', l, DECO_BLOCKS),
  );
}

/** Besoins en bail-out : litres déjà calculés, blocs 7 L/200 b et 11 L/200 b. */
export function bailoutGasNeeds(runtime: Pick<WhatIfRuntime, 'gasUsage'>): RuntimeGasNeed[] {
  return (runtime.gasUsage ?? []).map(g => toNeed(g.gasName, 'bailout', g.litres, BAILOUT_BLOCKS));
}
