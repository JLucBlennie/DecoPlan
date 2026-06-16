// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — Table MN90 (extrait des plongées les plus courantes Niv.2/3)
// ─────────────────────────────────────────────────────────────────────────────
import type { DivePlan, MN90Profile } from './types';

interface MN90Entry {
  maxDepthM: number;
  bottomTimeMin: number;
  stops: Array<{ depthM: number; durationMin: number }>;
}

/**
 * Extrait de la table MN90.
 * Les temps de fond sont des TEMPS DE FOND (depuis la fin de la descente).
 * Vitesse de remontée : 15 m/min (MN90).
 */
const MN90_TABLE: MN90Entry[] = [
  // ── 20 m ─────────────────────────────────────────────────────────────────
  { maxDepthM: 20, bottomTimeMin: 20, stops: [] },
  { maxDepthM: 20, bottomTimeMin: 30, stops: [] },
  { maxDepthM: 20, bottomTimeMin: 40, stops: [{ depthM: 3, durationMin: 5 }] },
  { maxDepthM: 20, bottomTimeMin: 50, stops: [{ depthM: 3, durationMin: 15 }] },
  { maxDepthM: 20, bottomTimeMin: 60, stops: [{ depthM: 3, durationMin: 26 }] },

  // ── 25 m ─────────────────────────────────────────────────────────────────
  { maxDepthM: 25, bottomTimeMin: 15, stops: [] },
  { maxDepthM: 25, bottomTimeMin: 20, stops: [] },
  { maxDepthM: 25, bottomTimeMin: 30, stops: [{ depthM: 3, durationMin: 3 }] },
  { maxDepthM: 25, bottomTimeMin: 40, stops: [{ depthM: 3, durationMin: 13 }] },
  { maxDepthM: 25, bottomTimeMin: 50, stops: [{ depthM: 3, durationMin: 27 }] },

  // ── 30 m ─────────────────────────────────────────────────────────────────
  { maxDepthM: 30, bottomTimeMin: 10, stops: [] },
  { maxDepthM: 30, bottomTimeMin: 15, stops: [] },
  { maxDepthM: 30, bottomTimeMin: 20, stops: [{ depthM: 3, durationMin: 3 }] },
  { maxDepthM: 30, bottomTimeMin: 25, stops: [{ depthM: 3, durationMin: 9 }] },
  { maxDepthM: 30, bottomTimeMin: 30, stops: [{ depthM: 3, durationMin: 17 }] },
  { maxDepthM: 30, bottomTimeMin: 35, stops: [{ depthM: 3, durationMin: 24 }] },
  { maxDepthM: 30, bottomTimeMin: 40, stops: [{ depthM: 3, durationMin: 33 }] },

  // ── 35 m ─────────────────────────────────────────────────────────────────
  { maxDepthM: 35, bottomTimeMin: 10, stops: [] },
  { maxDepthM: 35, bottomTimeMin: 15, stops: [{ depthM: 3, durationMin: 2 }] },
  { maxDepthM: 35, bottomTimeMin: 20, stops: [{ depthM: 3, durationMin: 11 }] },
  { maxDepthM: 35, bottomTimeMin: 25, stops: [{ depthM: 3, durationMin: 22 }] },
  { maxDepthM: 35, bottomTimeMin: 30, stops: [{ depthM: 3, durationMin: 35 }] },

  // ── 40 m ─────────────────────────────────────────────────────────────────
  { maxDepthM: 40, bottomTimeMin: 8, stops: [] },
  { maxDepthM: 40, bottomTimeMin: 10, stops: [{ depthM: 3, durationMin: 3 }] },
  { maxDepthM: 40, bottomTimeMin: 15, stops: [{ depthM: 6, durationMin: 1 }, { depthM: 3, durationMin: 16 }] },
  { maxDepthM: 40, bottomTimeMin: 20, stops: [{ depthM: 6, durationMin: 3 }, { depthM: 3, durationMin: 30 }] },

  // ── 50 m ─────────────────────────────────────────────────────────────────
  { maxDepthM: 50, bottomTimeMin: 5, stops: [] },
  { maxDepthM: 50, bottomTimeMin: 8, stops: [{ depthM: 3, durationMin: 4 }] },
  { maxDepthM: 50, bottomTimeMin: 10, stops: [{ depthM: 6, durationMin: 1 }, { depthM: 3, durationMin: 15 }] },
  { maxDepthM: 50, bottomTimeMin: 15, stops: [{ depthM: 9, durationMin: 1 }, { depthM: 6, durationMin: 3 }, { depthM: 3, durationMin: 30 }] },
];

/**
 * Retourne le profil MN90 correspondant au plan de plongée fourni.
 * Cherche l'entrée la plus proche (même profondeur, temps de fond ≤ planifié).
 * Retourne undefined si hors table.
 */
export function getMN90Profile(plan: DivePlan): MN90Profile | undefined {
  const maxDepth = Math.max(...plan.segments.map(s => Math.max(s.startDepthM, s.endDepthM)));

  // Temps de fond = durée des segments plats à la profondeur max
  const bottomTimeMin = plan.segments
    .filter(s => s.startDepthM === s.endDepthM && s.startDepthM >= maxDepth * 0.9)
    .reduce((sum, s) => sum + (s.endTimeMin - s.startTimeMin), 0);

  // Recherche la profondeur exacte (±2m) et le temps de fond le plus proche ≤ planifié
  const candidates = MN90_TABLE.filter(
    e => Math.abs(e.maxDepthM - maxDepth) <= 2 && e.bottomTimeMin <= bottomTimeMin + 5
  );

  if (candidates.length === 0) return undefined;

  // Prend le temps de fond ≤ bottomTimeMin le plus proche par excès
  const entry = candidates.sort((a, b) => {
    const da = Math.abs(a.bottomTimeMin - bottomTimeMin);
    const db = Math.abs(b.bottomTimeMin - bottomTimeMin);
    return da - db;
  })[0];

  const ascentTimeMin = entry.stops.reduce((t, s) => {
    const prevDepth = t === 0 ? entry.maxDepthM : 0;
    return t + s.durationMin + (prevDepth - s.depthM) / 15;
  }, entry.maxDepthM / 15);

  return {
    maxDepthM: entry.maxDepthM,
    bottomTimeMin: entry.bottomTimeMin,
    stops: entry.stops,
    totalAscentTimeMin: Math.round(ascentTimeMin),
  };
}
