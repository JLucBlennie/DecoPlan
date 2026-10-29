/**
 * DecoPlan – WhatIf : formats d'affichage (minutes, écarts)
 */

/** Minutes arrondies ; une durée non nulle sous 30 s s'affiche « <1 » plutôt que « 0 ». */
export function formatMinutes(min: number): string {
  if (min > 0 && min < 0.5) return '<1';
  return String(Math.round(min));
}

/** Écart signé en minutes : « +5 », « −9 » (vrai signe moins), « 0 ». */
export function formatDeltaMinutes(deltaMin: number): string {
  const rounded = Math.round(deltaMin);
  if (rounded > 0) return `+${rounded}`;
  if (rounded < 0) return `−${Math.abs(rounded)}`;
  return '0';
}

export type DeltaTrend = 'worse' | 'better' | 'same';

/** Plus long = moins favorable (plus de déco) ; plus court = plus favorable. */
export function deltaTrend(deltaMin: number): DeltaTrend {
  const rounded = Math.round(deltaMin);
  if (rounded > 0) return 'worse';
  if (rounded < 0) return 'better';
  return 'same';
}
