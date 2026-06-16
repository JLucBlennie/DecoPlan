/**
 * DecoPlan – Segments de plongée
 *
 * Un segment représente une phase du profil :
 *   - descente  : startDepth < endDepth
 *   - palier    : startDepth === endDepth
 *   - remontée  : startDepth > endDepth
 */

import type { Segment } from './types';
import { DEPTH_TO_PRESS_FACTOR } from './physics';

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createSegment(
  startDepth: number,
  endDepth: number,
  gasName: string,
  time: number,
): Segment {
  return { startDepth, endDepth, gasName, time };
}

// ─── Opérations ───────────────────────────────────────────────────────────────

/**
 * Fusionne les segments de palier consécutifs ayant le même gaz.
 * Retourne un nouvel array sans muter l'entrée.
 */
export function collapseSegments(segments: Segment[]): Segment[] {
  // Copie profonde pour ne pas muter l'array d'origine (important pour React state)
  let result = segments.map(s => ({ ...s }));
  let merged = true;

  while (merged) {
    merged = false;
    for (let i = 0; i < result.length - 1; i++) {
      const s1 = result[i];
      const s2 = result[i + 1];
      const bothAreStops =
        s1.startDepth === s1.endDepth &&
        s2.startDepth === s2.endDepth;
      const sameDepth   = s1.endDepth === s2.startDepth;
      const sameGas     = s1.gasName  === s2.gasName;

      if (bothAreStops && sameDepth && sameGas) {
        result[i] = { ...s1, time: s1.time + s2.time };
        result.splice(i + 1, 1);
        merged = true;
        break;
      }
    }
  }

  return result;
}

/** Durée totale d'un ensemble de segments (minutes). */
export function totalTime(segments: Segment[]): number {
  return segments.reduce((sum, s) => sum + s.time, 0);
}

/** Profondeur maximale d'un ensemble de segments (mètres). */
export function maxDepth(segments: Segment[]): number {
  if (segments.length === 0) return 0;
  return Math.max(...segments.flatMap(s => [s.startDepth, s.endDepth]));
}

/** Indique si un segment est un palier de décompression (profondeur constante). */
export function isDecoStop(segment: Segment): boolean {
  return segment.startDepth === segment.endDepth;
}

/** Indique si un segment est une remontée. */
export function isAscent(segment: Segment): boolean {
  return segment.endDepth < segment.startDepth;
}

/** Indique si un segment est une descente. */
export function isDescent(segment: Segment): boolean {
  return segment.endDepth > segment.startDepth;
}

// ─── Calcul de consommation de gaz ───────────────────────────────────────────

/**
 * Volume de gaz consommé sur un segment (en litres × bar ou litres selon rmv).
 * @param rmv  Respiratory Minute Volume (L/min surface)
 * @param ascentRate   vitesse de remontée (m/min, valeur négative)
 * @param descentRate  vitesse de descente (m/min, valeur positive)
 * @param segmentFlags bitmask : 1 = inclure phase transition, 2 = inclure phase palier
 */
export function getSegmentGas(
  startDepth: number,
  endDepth: number,
  rmv: number,
  ascentRate: number,
  descentRate: number,
  segmentTime: number,
  segmentFlags: number,
): number {
  if (
    ascentRate > -1 || descentRate < 1 ||
    startDepth < 0  || endDepth < 0    ||
    segmentTime < 0
  ) return -1;

  const rate = startDepth > endDepth ? ascentRate
             : startDepth < endDepth ? descentRate
             : 1;

  if (startDepth !== endDepth && (endDepth - startDepth) / rate > segmentTime) {
    return -1;
  }

  let gas = 0;
  const transitionTime = (endDepth - startDepth) / rate;

  if (transitionTime > 0 && (segmentFlags & 1) === 1) {
    const startPres  = depth2press(startDepth);
    const endPres    = depth2press(endDepth);
    gas = (startPres + endPres) / 2 * rmv * transitionTime;
  }

  const stopTime = segmentTime - transitionTime;
  if ((segmentFlags & 2) === 2) {
    gas += depth2press(endDepth) * rmv * stopTime;
  }

  return gas;
}

function depth2press(depth: number): number {
  return depth / DEPTH_TO_PRESS_FACTOR + 1;
}
