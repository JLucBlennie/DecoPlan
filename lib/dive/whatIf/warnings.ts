/**
 * DecoPlan – WhatIf : avertissements de sécurité sur la phase fond
 */

import type { DiveDefinition } from './types';

/** PpO₂ au-delà de la limite fond, pour chaque gaz respiré dans le profil saisi. */
export function collectWarnings(def: DiveDefinition): string[] {
  const gases = [...def.bottomGases, ...def.decoGases];
  const warnings = new Set<string>();

  for (const seg of def.bottomSegments) {
    const gas = gases.find(g => g.name === seg.gasName);
    if (!gas) continue;

    const depth = Math.max(seg.startDepth, seg.endDepth);
    const ppO2 = gas.ppO2AtDepth(depth, def.isFreshWater);

    if (ppO2 > def.maxBottomPpO2 + 1e-9) {
      warnings.add(
        `PpO₂ ${ppO2.toFixed(2)} bar sur ${gas.name} à ${depth} m (limite ${def.maxBottomPpO2} bar)`,
      );
    }
  }

  return [...warnings];
}
