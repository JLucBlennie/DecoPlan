/**
 * DecoPlan – WhatIf : avertissements de sécurité sur la phase fond
 */

import type { DiveDefinition } from './types';

/** PpO₂ au-delà de la limite fond, pour chaque gaz respiré dans le profil saisi. */
export function collectWarnings(def: DiveDefinition): string[] {
  return def.ccr ? collectCcrWarnings(def) : collectOpenCircuitWarnings(def);
}

/** CCR : set point haut trop élevé, ou diluant trop riche pour tenir le set point. */
function collectCcrWarnings(def: DiveDefinition): string[] {
  if (!def.ccr) return [];
  const { config } = def.ccr;
  const warnings: string[] = [];

  if (config.setpointHighBar > def.maxBottomPpO2 + 1e-9) {
    warnings.push(
      `Set point haut ${config.setpointHighBar} bar au-dessus de la limite fond (${def.maxBottomPpO2} bar)`,
    );
  }

  const diluent = def.bottomGases.find(g => g.name === config.diluentName);
  if (diluent) {
    const deepest = Math.max(0, ...def.bottomSegments.map(s => Math.max(s.startDepth, s.endDepth)));
    const ppO2 = diluent.ppO2AtDepth(deepest, def.isFreshWater);
    if (ppO2 > config.setpointHighBar + 1e-9) {
      warnings.push(
        `Diluant ${diluent.name} trop riche à ${deepest} m : ppO₂ ${ppO2.toFixed(2)} bar > set point ${config.setpointHighBar} bar`,
      );
    }
  }
  return warnings;
}

function collectOpenCircuitWarnings(def: DiveDefinition): string[] {
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
