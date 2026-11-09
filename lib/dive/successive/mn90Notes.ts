/**
 * DecoPlan – Plongées successives : remarques sur la comparaison MN90
 *
 * Les tables MN90 sont lues à l'air. Quand une plongée utilise un autre gaz (déco
 * enrichie, par exemple), l'écart avec Bühlmann vient de l'algorithme ET du gaz :
 * c'est instructif (intérêt de la déco aux gaz enrichis) mais il faut le dire.
 */

import type { Gas } from '../gas';
import type { DiveDefinition } from '../whatIf/types';

const AIR_FO2 = 0.21;
const TOLERANCE = 0.005;

function isAir(gas: Gas): boolean {
  return gas.fHe === 0 && Math.abs(gas.fO2 - AIR_FO2) < TOLERANCE;
}

function nonAirNames(def: DiveDefinition): string[] {
  return [...def.bottomGases, ...def.decoGases].filter(g => !isAir(g)).map(g => g.name);
}

export function mn90Notes(first: DiveDefinition, second: DiveDefinition): string[] {
  const names = [...new Set([...nonAirNames(first), ...nonAirNames(second)])];
  if (names.length === 0) return [];
  return [
    `Gaz autre que l'air (${names.join(', ')}) : MN90 est lu à l'air, l'écart avec Bühlmann `
      + `inclut donc l'effet du gaz — c'est aussi ce qui montre l'intérêt d'une déco aux gaz enrichis.`,
  ];
}
