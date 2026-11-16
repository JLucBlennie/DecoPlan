/**
 * DecoPlan – Volumes de gaz nécessaires pour une plongée en circuit ouvert.
 *
 * Volume (L, détendu) = RMV × Pamb moyenne × durée, par gaz.
 * RMV fond pour le gaz de fond, RMV déco pour les gaz de déco.
 */

import { depthInMetersToBars } from './physics';
import type { DivePlan, GasNeed } from './types';

export function gasNeedsFromPlan(plan: DivePlan, rmvFondLMin: number, rmvDecoLMin: number): GasNeed[] {
  const litresByGas = new Map<string, number>();

  for (const seg of plan.segments) {
    const gas = plan.gases.find(g => g.id === seg.gasId);
    const rmv = gas?.role === 'deco' ? rmvDecoLMin : rmvFondLMin;
    const pAvg = (depthInMetersToBars(seg.startDepthM, false) + depthInMetersToBars(seg.endDepthM, false)) / 2;
    litresByGas.set(seg.gasId, (litresByGas.get(seg.gasId) ?? 0) + rmv * pAvg * (seg.endTimeMin - seg.startTimeMin));
  }

  return plan.gases
    .filter(g => litresByGas.has(g.id))
    .map(g => ({ gasId: g.id, label: g.label, role: g.role, litres: litresByGas.get(g.id) ?? 0 }));
}
