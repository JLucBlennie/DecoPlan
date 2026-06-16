/**
 * DecoPlan – Toxicité oxygène
 *
 * OTU  : Oxygen Toxicity Units (toxicité pulmonaire)
 * CNS  : Central Nervous System toxicity (toxicité système nerveux central)
 *
 * Les deux fonctions retournent -1 si les paramètres sont invalides.
 */

import { DEPTH_TO_PRESS_FACTOR } from './physics';

// ─── Helpers locaux ───────────────────────────────────────────────────────────

function depth2press(depth: number): number {
  return depth / DEPTH_TO_PRESS_FACTOR + 1;
}

function resolveRate(
  startDepth: number,
  endDepth: number,
  ascentRate: number,
  descentRate: number,
): number {
  if (startDepth > endDepth) return ascentRate;
  if (startDepth < endDepth) return descentRate;
  return 1;
}

function validateParams(
  ascentRate: number, descentRate: number,
  startDepth: number, endDepth: number,
  segmentTime: number, fO2First: number, fO2Second: number,
): boolean {
  return !(
    ascentRate  >  -1 || descentRate  <  1  ||
    startDepth  <   0 || endDepth     <  0  ||
    segmentTime <   0 ||
    fO2First  > 1 || fO2First  < 0 ||
    fO2Second > 1 || fO2Second < 0
  );
}

// ─── OTU ─────────────────────────────────────────────────────────────────────

/**
 * Calcule les OTU (Unités de Toxicité Oxygène) pour un segment.
 * Mesure la toxicité pulmonaire cumulée.
 *
 * @param ascentRate  vitesse de remontée (m/min, valeur négative, ex: -10)
 * @param descentRate vitesse de descente (m/min, valeur positive, ex: 20)
 * @returns OTU du segment, ou -1 si paramètres invalides
 */
export function getSegmentOTU(
  startDepth: number,
  endDepth: number,
  fO2First: number,
  fO2Second: number,
  ascentRate: number,
  descentRate: number,
  segmentTime: number,
): number {
  if (!validateParams(ascentRate, descentRate, startDepth, endDepth, segmentTime, fO2First, fO2Second)) {
    return -1;
  }

  let otu = 0;
  const rate = resolveRate(startDepth, endDepth, ascentRate, descentRate);
  const transitionTime = (endDepth - startDepth) / rate;

  // Phase de transition (descente ou remontée)
  if (transitionTime > 0) {
    const startPres = depth2press(startDepth);
    const endPres   = depth2press(endDepth);
    const maxPO2    = Math.max(startPres, endPres) * fO2First;
    const minPO2    = Math.min(startPres, endPres) * fO2First;

    if (maxPO2 > 0.5) {
      const lowPO2  = Math.max(0.5, minPO2);
      const o2Time  = transitionTime * (maxPO2 - lowPO2) / (maxPO2 - minPO2);
      const otuCalc = 3.0 / 11.0 * o2Time / (maxPO2 - lowPO2) *
        (Math.pow((maxPO2 - 0.5) / 0.5, 11.0 / 6.0) -
         Math.pow((lowPO2 - 0.5) / 0.5, 11.0 / 6.0));
      otu += Math.max(0, otuCalc);
    }
  }

  // Phase de palier
  const stopTime   = segmentTime - transitionTime;
  const stopPO2    = depth2press(endDepth) * fO2Second;
  if (stopPO2 > 0.5 && stopTime > 0) {
    otu += stopTime * Math.pow(0.5 / (stopPO2 - 0.5), -5.0 / 6.0);
  }

  return otu;
}

// ─── CNS ─────────────────────────────────────────────────────────────────────

// Table NOAA de limites CNS par plage de PpO₂
const CNS_TABLE = [
  { lo: 0.5, hi: 0.6, slp: 1800,  intercept: 1800   },
  { lo: 0.6, hi: 0.7, slp: -1500, intercept: 1620   },
  { lo: 0.7, hi: 0.8, slp: -1200, intercept: 1410   },
  { lo: 0.8, hi: 0.9, slp: -900,  intercept: 1171   },
  { lo: 0.9, hi: 1.1, slp: -600,  intercept: 900    },
  { lo: 1.1, hi: 1.5, slp: -300,  intercept: 570    },
  { lo: 1.5, hi: 1.6, slp: -750,  intercept: 1245   },
  { lo: 1.6, hi: 1.7, slp: -280,  intercept: 493    },
  { lo: 1.7, hi: 1.8, slp: -72,   intercept: 139.4  },
  { lo: 1.8, hi: 2.0, slp: -44,   intercept: 89     },
] as const;

function findCnsLimit(pO2: number): number {
  const row = CNS_TABLE.find(r => pO2 > r.lo && pO2 <= r.hi);
  return row ? row.slp * pO2 + row.intercept : -1;
}

/**
 * Calcule la fraction CNS accumulée pour un segment.
 * Une valeur ≥ 1.0 indique un risque de toxicité SNC.
 *
 * @returns fraction CNS [0..∞), ou -1 si paramètres invalides
 */
export function getSegmentCNS(
  startDepth: number,
  endDepth: number,
  fO2First: number,
  fO2Second: number,
  ascentRate: number,
  descentRate: number,
  segmentTime: number,
): number {
  if (!validateParams(ascentRate, descentRate, startDepth, endDepth, segmentTime, fO2First, fO2Second)) {
    return -1;
  }

  let cns = 0;
  const rate = resolveRate(startDepth, endDepth, ascentRate, descentRate);
  const transitionTime = (endDepth - startDepth) / rate;

  // Phase de transition
  if (transitionTime > 0) {
    const startPres = depth2press(startDepth);
    const endPres   = depth2press(endDepth);
    const maxPO2    = Math.max(startPres, endPres) * fO2First;
    const minPO2    = Math.min(startPres, endPres) * fO2First;

    if (maxPO2 > 2.0) return 5 * segmentTime; // PpO₂ dangereuse → CNS maximal
    if (maxPO2 > 0.5) {
      const lowPO2 = Math.max(0.5, minPO2);

      for (const row of CNS_TABLE) {
        if (maxPO2 <= row.lo || lowPO2 > row.hi) continue;

        const pO2start = startDepth > endDepth
          ? Math.min(maxPO2, row.hi)
          : Math.max(lowPO2, row.lo);
        const pO2end = startDepth > endDepth
          ? Math.max(lowPO2, row.lo)
          : Math.min(maxPO2, row.hi);
        const deltaPO2  = pO2end - pO2start;
        const o2Time    = maxPO2 !== lowPO2
          ? transitionTime * Math.abs(deltaPO2) / (maxPO2 - lowPO2)
          : 0;

        if (o2Time > 0) {
          const tlim = row.slp * pO2start + row.intercept;
          const mk   = row.slp * (deltaPO2 / o2Time);
          cns += 1.0 / mk * (
            Math.log(Math.abs(tlim + mk * o2Time)) -
            Math.log(Math.abs(tlim))
          );
        }
      }
    }
  }

  // Phase de palier
  const stopTime = segmentTime - transitionTime;
  if (stopTime > 0) {
    const stopPO2 = depth2press(endDepth) * fO2Second;
    if (stopPO2 > 2.0) return cns + 5 * stopTime;
    if (stopPO2 > 0.5) {
      const tlim = findCnsLimit(stopPO2);
      if (tlim <= 0) return -1;
      cns += stopTime / tlim;
    }
  }

  return cns;
}
