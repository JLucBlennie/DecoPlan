// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — Hook de simulation pédagogique
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react';
import {
  DEFAULT_DT_MIN,
  DEFAULT_RMV_L_MIN,
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

function activeGasAtTime(plan: DivePlan, t: number, depthM: number): GasConso {
  const bottomGas = plan.gases.find(g => g.role === 'bottom') ?? plan.gases[0];

  // Sur la remontée, on cherche le gaz de déco applicable le plus profond
  const seg = plan.segments.find(s => t >= s.startTimeMin && t <= s.endTimeMin);
  const ascending = seg ? seg.endDepthM < seg.startDepthM : false;

  if (ascending) {
    const decoGases = plan.gases
      .filter(g => g.role === 'deco' && g.switchDepthM !== undefined)
      .sort((a, b) => (b.switchDepthM ?? 0) - (a.switchDepthM ?? 0)); // plus profond en premier

    for (const gas of decoGases) {
      if (depthM <= (gas.switchDepthM ?? 0)) {
        return gas;
      }
    }
  }

  return bottomGas;
}

/** Valeur-M avec GF appliqué (ligne de gradient) */
function mValueGF(
  compartmentIndex: number,
  pAmb: number,
  gfLow: number,
  gfHigh: number,
  firstStopPAmb: number
): number {
  const { a, b } = ZHL16C_N2[compartmentIndex];
  const mValueAtAmb = a + pAmb / b;
  // Interpolation GF entre première butée (gfLow) et surface (gfHigh)
  const gf = firstStopPAmb > WATER_VAPOR_PRESSURE_BAR
    ? gfLow + (gfHigh - gfLow) * (firstStopPAmb - pAmb) / (firstStopPAmb - 1.0)
    : gfHigh;
  const clampedGF = Math.min(gfHigh, Math.max(gfLow, gf));
  return 1.0 + clampedGF * (mValueAtAmb - 1.0);
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function usePedagogicalSimulation(
  plan: DivePlan,
  dtMin: number = DEFAULT_DT_MIN,
  rmvSurface: number = DEFAULT_RMV_L_MIN
): PedagogicalSimulation {
  return useMemo(() => {
    const lastSeg = plan.segments[plan.segments.length - 1];
    const totalTimeMin = lastSeg?.endTimeMin ?? 0;
    const stepCount = Math.round(totalTimeMin / dtMin);

    // Saturation de surface initiale pour l'air (bottom gas)
    const bottomGas = plan.gases.find(g => g.role === 'bottom') ?? plan.gases[0];
    const surfaceN2 = bottomGas.fN2 * (1 - WATER_VAPOR_PRESSURE_BAR);

    // État tissulaire initial (équilibre surface)
    let n2 = Array<number>(NC).fill(surfaceN2);
    let he = Array<number>(NC).fill(0);

    // Consommation gaz
    const gasConsumedL: Record<string, number> = {};
    for (const g of plan.gases) gasConsumedL[g.id] = 0;

    // Estimation de la pression à la première butée (pour le slope GF)
    // Approximation : on prend la profondeur du premier palier + 10%
    const firstStopSeg = plan.segments.find(
      s => s.startDepthM === s.endDepthM && s.startDepthM < 10
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
        // ── Mise à jour des compartiments N2 ──────────────────────────────
        const pAlvN2 = gas.fN2 * (pAmb - WATER_VAPOR_PRESSURE_BAR);
        n2 = n2.map((p, i) => {
          const k = Math.LN2 / ZHL16C_N2[i].halfTime;
          return pAlvN2 + (p - pAlvN2) * Math.exp(-k * dtMin);
        });

        // ── Mise à jour des compartiments He (si gaz trimix) ─────────────
        if (gas.fHe > 0) {
          const pAlvHe = gas.fHe * (pAmb - WATER_VAPOR_PRESSURE_BAR);
          he = he.map((p, i) => {
            const k = Math.LN2 / ZHL16C_HE[i].halfTime;
            return pAlvHe + (p - pAlvHe) * Math.exp(-k * dtMin);
          });
        }

        // ── Consommation gaz ──────────────────────────────────────────────
        const avgPAmb = 1 + (depth + prevDepth) / 20;
        gasConsumedL[gas.id] += rmvSurface * avgPAmb * dtMin;
      }

      // ── Calcul des ratios de saturation avec GF ───────────────────────────
      const saturationRatios = n2.map((pN2, i) => {
        const pHe = he[i];
        const pTotal = pN2 + pHe; // pression totale inerte
        const mGF = mValueGF(i, pAmb, plan.gfLow, plan.gfHigh, firstStopPAmb);
        return Math.max(0, (pTotal - surfaceN2) / (mGF - surfaceN2));
      });

      const leadingIdx = saturationRatios.indexOf(Math.max(...saturationRatios));

      // ── Pression restante par bloc ────────────────────────────────────────
      const gasRemainingBar: Record<string, number> = {};
      for (const g of plan.gases) {
        gasRemainingBar[g.id] = Math.max(
          0,
          g.startPressureBar - gasConsumedL[g.id] / g.tankVolumeLiters
        );
      }

      frames.push({
        timeMin: t,
        depthM: depth,
        pAmbBar: pAmb,
        tissues: { n2PressuresBar: [...n2], hePressuresBar: [...he] },
        gasRemainingBar,
        activeGasId: gas.id,
        leadingCompartmentIndex: leadingIdx,
        saturationRatios,
      });

      prevDepth = depth;
    }

    return { frames, totalTimeMin, dtMin, stepCount };
  }, [plan, dtMin, rmvSurface]);
}
