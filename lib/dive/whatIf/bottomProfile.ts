/**
 * DecoPlan – WhatIf : transformations du profil saisi (descente + fond)
 *
 * Fonctions pures, elles retournent de nouveaux tableaux sans muter l'entrée.
 */

import { isDecoStop, maxDepth } from '../segment';
import type { Segment } from '../types';

function copy(segments: Segment[]): Segment[] {
  return segments.map(s => ({ ...s }));
}

function lastFlatIndex(segments: Segment[], depth?: number): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];
    if (!isDecoStop(s) || s.startDepth <= 0) continue;
    if (depth === undefined || s.startDepth === depth) return i;
  }
  return -1;
}

/**
 * Descend le niveau le plus profond de deltaM mètres.
 * Les transitions touchées gardent leur vitesse : leur durée est ajustée
 * proportionnellement à la nouvelle distance. Les paliers de fond gardent leur durée.
 */
export function shiftDeepestLevel(segments: Segment[], deltaM: number): Segment[] {
  const deepest = maxDepth(segments);

  return segments.map(seg => {
    const startDepth = seg.startDepth === deepest ? seg.startDepth + deltaM : seg.startDepth;
    const endDepth = seg.endDepth === deepest ? seg.endDepth + deltaM : seg.endDepth;

    const oldTravel = Math.abs(seg.endDepth - seg.startDepth);
    const newTravel = Math.abs(endDepth - startDepth);
    const time = oldTravel > 0 ? (seg.time * newTravel) / oldTravel : seg.time;

    return { ...seg, startDepth, endDepth, time };
  });
}

/**
 * Prolonge de extraMin minutes le dernier niveau de fond.
 * Sans niveau plat dans le profil, ajoute un niveau à la dernière profondeur atteinte.
 */
export function extendLastLevel(segments: Segment[], extraMin: number): Segment[] {
  if (segments.length === 0) return [];

  const result = copy(segments);
  const idx = lastFlatIndex(result);

  if (idx >= 0) {
    result[idx].time += extraMin;
    return result;
  }

  const last = result[result.length - 1];
  result.push({
    startDepth: last.endDepth,
    endDepth: last.endDepth,
    gasName: last.gasName,
    time: extraMin,
  });
  return result;
}

/**
 * Limite le séjour au fond à bottomTimeMin minutes puis coupe le profil :
 * les niveaux suivants sont abandonnés, la remontée est recalculée.
 * Un fond déjà plus court que bottomTimeMin reste inchangé.
 */
export function truncateBottomTime(segments: Segment[], bottomTimeMin: number): Segment[] {
  if (segments.length === 0) return [];

  const deepest = maxDepth(segments);
  const idx = lastFlatIndex(segments, deepest);

  if (idx >= 0) {
    const kept = copy(segments.slice(0, idx + 1));
    kept[idx].time = Math.min(kept[idx].time, bottomTimeMin);
    return kept;
  }

  // Profil sans niveau plat au fond : on s'arrête à l'arrivée au fond.
  const reach = segments.findIndex(s => s.endDepth === deepest);
  if (reach < 0) return copy(segments);

  return [
    ...copy(segments.slice(0, reach + 1)),
    {
      startDepth: deepest,
      endDepth: deepest,
      gasName: segments[reach].gasName,
      time: bottomTimeMin,
    },
  ];
}
