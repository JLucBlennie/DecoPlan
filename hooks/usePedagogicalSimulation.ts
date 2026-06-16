// hooks/usePedagogicalSimulation.ts
import { useMemo } from 'react';
import {
  DEFAULT_DT_MIN,
  NC,
  WATER_VAPOR_PRESSURE_BAR,
  ZHL16C_HE,
  ZHL16C_N2,
} from '../lib/dive/constants';
import type { DivePlan, GasConso, PedagogicalSimulation, SimulationFrame } from '../lib/dive/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function depthAtTime(plan: DivePlan, t: number): number {
  for (const seg of plan.segments) {
    if (t >= seg.startTimeMin && t <= seg.endTimeMin) {
      const ratio = (t - seg.startTimeMin) / (seg.endTimeMin - seg.startTimeMin);
      return seg.startDepthM + (seg.endDepthM - seg.startDepthM) * ratio;
    }
  }
  return 0;
}

/**
 * Détermine le gaz actif à un instant donné.
 *
 * CORRECTION du bug :
 * L'ancienne logique vérifiait `ascending = seg.endDepthM < seg.startDepthM`,
 * ce qui est FALSE sur les paliers plats (endDepthM === startDepthM).
 * Résultat : le gaz fond était utilisé pendant les paliers déco au lieu du gaz déco.
 *
 * Nouvelle logique :
 * - Si le segment EST une descente → gaz fond (on n'a pas encore atteint le switch)
 * - Sinon (palier au fond, remontée, palier déco) → chercher le gaz déco applicable
 *   selon la profondeur actuelle (depth ≤ switchDepthM du gaz le plus profond disponible)
 */
function activeGasAtTime(plan: DivePlan, t: number, depthM: number): GasConso {
  const bottomGas = plan.gases.find(g => g.role === 'bottom') ?? plan.gases[0];

  const seg = plan.segments.find(s => t >= s.startTimeMin && t <= s.endTimeMin);

  // Descente pure → toujours gaz fond
  const descending = seg ? seg.endDepthM > seg.startDepthM : false;
  if (descending) return bottomGas;

  // Palier fond ou remontée ou palier déco :
  // chercher le gaz déco le plus profond applicable à la profondeur courante
  const decoGases = plan.gases
    .filter(g => g.role === 'deco' && g.switchDepthM !== undefined)
    .sort((a, b) => (b.switchDepthM ?? 0) - (a.switchDepthM ?? 0)); // plus profond en premier

  for (const gas of decoGases) {
    if (depthM <= (gas.switchDepthM ?? 0)) {
      return gas;
    }
  }

  return bottomGas;
}

/** Valeur-M avec GF appliqué */
function mValueGF(
  idx: number,
  pAmb: number,
  gfLow: number,
  gfHigh: number,
  firstStopPAmb: number,
): number {
  const { a, b } = ZHL16C_N2[idx];
  const mValueAtAmb = a + pAmb / b;
  const gf = firstStopPAmb > WATER_VAPOR_PRESSURE_BAR
    ? gfLow + (gfHigh - gfLow) * (firstStopPAmb - pAmb) / (firstStopPAmb - 1.0)
    : gfHigh;
  return 1.0 + Math.min(gfHigh, Math.max(gfLow, gf)) * (mValueAtAmb - 1.0);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePedagogicalSimulation(
  plan: DivePlan,
  dtMin: number = DEFAULT_DT_MIN,
  /** RMV surface gaz de fond (L/min) */
  rmvFond: number = 20,
  /** RMV surface gaz de déco — typiquement plus faible car palier = effort réduit */
  rmvDeco: number = 15,
): PedagogicalSimulation {

  return useMemo(() => {
    const lastSeg = plan.segments[plan.segments.length - 1];
    const totalTimeMin = lastSeg?.endTimeMin ?? 0;
    const stepCount = Math.round(totalTimeMin / dtMin);

    const bottomGas = plan.gases.find(g => g.role === 'bottom') ?? plan.gases[0];
    const surfaceN2 = bottomGas.fN2 * (1 - WATER_VAPOR_PRESSURE_BAR);

    let n2 = Array<number>(NC).fill(surfaceN2);
    let he = Array<number>(NC).fill(0);

    const gasConsumedL: Record<string, number> = {};
    for (const g of plan.gases) gasConsumedL[g.id] = 0;

    const firstStopSeg = plan.segments.find(
      s => s.startDepthM === s.endDepthM && s.startDepthM < 10,
    );
    const firstStopPAmb = firstStopSeg ? 1 + firstStopSeg.startDepthM / 10 : 1.5;

    const frames: SimulationFrame[] = [];
    let prevDepth = 0;

    for (let s = 0; s <= stepCount; s++) {
      const t = s * dtMin;
      const depth = depthAtTime(plan, t);
      const pAmb = 1 + depth / 10;
      const gas = activeGasAtTime(plan, t, depth);

      if (s > 0) {
        // Compartiments N2
        const pAlvN2 = gas.fN2 * (pAmb - WATER_VAPOR_PRESSURE_BAR);
        n2 = n2.map((p, i) => {
          const k = Math.LN2 / ZHL16C_N2[i].halfTime;
          return pAlvN2 + (p - pAlvN2) * Math.exp(-k * dtMin);
        });

        // Compartiments He
        if (gas.fHe > 0) {
          const pAlvHe = gas.fHe * (pAmb - WATER_VAPOR_PRESSURE_BAR);
          he = he.map((p, i) => {
            const k = Math.LN2 / ZHL16C_HE[i].halfTime;
            return pAlvHe + (p - pAlvHe) * Math.exp(-k * dtMin);
          });
        }

        // Consommation — RMV différent fond vs déco
        const avgPAmb = 1 + (depth + prevDepth) / 20;
        const rmv = gas.role === 'deco' ? rmvDeco : rmvFond;
        gasConsumedL[gas.id] += rmv * avgPAmb * dtMin;
      }

      // Ratios de saturation
      const saturationRatios = n2.map((pN2, i) => {
        const pTotal = pN2 + he[i];
        const mGF = mValueGF(i, pAmb, plan.gfLow, plan.gfHigh, firstStopPAmb);
        return Math.max(0, (pTotal - surfaceN2) / (mGF - surfaceN2));
      });

      const leadingIdx = saturationRatios.indexOf(Math.max(...saturationRatios));

      // Pression restante
      const gasRemainingBar: Record<string, number> = {};
      for (const g of plan.gases) {
        gasRemainingBar[g.id] = Math.max(
          0,
          g.startPressureBar - gasConsumedL[g.id] / g.tankVolumeLiters,
        );
      }

      frames.push({
        timeMin: t, depthM: depth, pAmbBar: pAmb,
        tissues: { n2PressuresBar: [...n2], hePressuresBar: [...he] },
        gasRemainingBar,
        activeGasId: gas.id,
        leadingCompartmentIndex: leadingIdx,
        saturationRatios,
      });

      prevDepth = depth;
    }

    return { frames, totalTimeMin, dtMin, stepCount };
  }, [plan, dtMin, rmvFond, rmvDeco]);
}