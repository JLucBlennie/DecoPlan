/**
 * DecoPlan – WhatIf : scénarios
 *
 * applyScenario() transforme une DiveDefinition en une autre, sans calcul de déco.
 * Le recalcul du runtime est fait ailleurs (runtime.ts).
 */

import { extendLastLevel, shiftDeepestLevel, truncateBottomTime } from './bottomProfile';
import type { DiveDefinition, WhatIfKind, WhatIfOptions } from './types';

export const DEFAULT_WHATIF_OPTIONS: WhatIfOptions = {
  deeperByM: 5,
  longerByMin: 5,
  shortBottomTimeMin: 5,
};

/** Ordre d'affichage des runtimes. */
export const WHATIF_KINDS: readonly WhatIfKind[] = [
  'NOMINAL',
  'LOST_DECO_GAS',
  'DEEPER',
  'LONGER',
  'SHORT_BOTTOM',
  'BAILOUT',
];

export function scenarioLabel(kind: WhatIfKind, options: WhatIfOptions): string {
  switch (kind) {
    case 'NOMINAL':       return 'Nominal';
    case 'LOST_DECO_GAS': return 'Perte des gaz de déco';
    case 'DEEPER':        return `+${options.deeperByM} m plus profond`;
    case 'LONGER':        return `+${options.longerByMin} min au fond`;
    case 'SHORT_BOTTOM':  return `${options.shortBottomTimeMin} min seulement au fond`;
    case 'BAILOUT':       return 'Bail-out en fin de fond';
  }
}

/**
 * Gaz de déco conservés quand ils servent déjà pendant la phase saisie
 * (gaz de transit) : ils font alors partie du profil, pas du plan de déco.
 */
function decoGasesUsedInProfile(def: DiveDefinition) {
  const used = new Set(def.bottomSegments.map(s => s.gasName));
  return def.decoGases.filter(g => used.has(g.name));
}

/**
 * Scénarios qui ont un sens pour cette plongée : sans gaz de déco à perdre,
 * LOST_DECO_GAS donnerait exactement le nominal.
 */
export function applicableKinds(def: DiveDefinition): WhatIfKind[] {
  const hasDecoGasToLose = decoGasesUsedInProfile(def).length < def.decoGases.length;
  return WHATIF_KINDS.filter(kind => {
    // En CCR, les gaz de déco ne servent qu'au bail-out : les perdre ne change pas le nominal.
    if (kind === 'LOST_DECO_GAS') return !def.ccr && hasDecoGasToLose;
    // Le bail-out n'a de sens qu'en CCR, avec au moins un gaz de déco.
    if (kind === 'BAILOUT') return def.ccr !== undefined && def.decoGases.length > 0;
    return true;
  });
}

export function applyScenario(
  def: DiveDefinition,
  kind: WhatIfKind,
  options: WhatIfOptions = DEFAULT_WHATIF_OPTIONS,
): DiveDefinition {
  switch (kind) {
    case 'NOMINAL':
    case 'BAILOUT': // même profil que le nominal : la remontée change, pas le fond
      return def;

    // Remontée sur le gaz de fond, sans aucun gaz de déco.
    case 'LOST_DECO_GAS':
      return { ...def, decoGases: decoGasesUsedInProfile(def) };

    case 'DEEPER':
      return {
        ...def,
        bottomSegments: shiftDeepestLevel(def.bottomSegments, options.deeperByM),
      };

    case 'LONGER':
      return {
        ...def,
        bottomSegments: extendLastLevel(def.bottomSegments, options.longerByMin),
      };

    case 'SHORT_BOTTOM':
      return {
        ...def,
        bottomSegments: truncateBottomTime(def.bottomSegments, options.shortBottomTimeMin),
      };
  }
}
