/**
 * DecoPlan – Plongée
 *
 * Toutes les opérations retournent un nouvel objet Plongee
 * sans muter l'original — compatible avec React state.
 */

import uuid from 'react-native-uuid';
import type { Plongee, Segment, Gas } from './types';
import { maxDepth, totalTime } from './segment';

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createPlongee(name: string): Plongee {
  return {
    id: uuid.v4() as string,
    name,
    segments: [],
    gazFond: [],
    gazDeco: [],
  };
}

// ─── Opérations (immutables) ──────────────────────────────────────────────────

export function addSegment(plongee: Plongee, segment: Segment): Plongee {
  return { ...plongee, segments: [...plongee.segments, segment] };
}

export function removeSegment(plongee: Plongee, index: number): Plongee {
  return {
    ...plongee,
    segments: plongee.segments.filter((_, i) => i !== index),
  };
}

export function addGazFond(plongee: Plongee, gaz: Gas): Plongee {
  return { ...plongee, gazFond: [...plongee.gazFond, gaz] };
}

export function addGazDeco(plongee: Plongee, gaz: Gas): Plongee {
  return { ...plongee, gazDeco: [...plongee.gazDeco, gaz] };
}

export function removeGazFond(plongee: Plongee, gazId: string): Plongee {
  return { ...plongee, gazFond: plongee.gazFond.filter(g => g.id !== gazId) };
}

export function removeGazDeco(plongee: Plongee, gazId: string): Plongee {
  return { ...plongee, gazDeco: plongee.gazDeco.filter(g => g.id !== gazId) };
}

// ─── Calculs de résumé ────────────────────────────────────────────────────────

/** Profondeur maximale de la plongée (mètres). */
export function calculProfondeurMax(plongee: Plongee): number {
  return maxDepth(plongee.segments);
}

/** Durée totale de la plongée (minutes). */
export function calculTemps(plongee: Plongee): number {
  return totalTime(plongee.segments);
}

/** Indique si la plongée est valide pour lancer un calcul de runtime. */
export function isPlongeeValid(plongee: Plongee): boolean {
  return (
    plongee.segments.length > 0 &&
    plongee.gazFond.length > 0
  );
}
