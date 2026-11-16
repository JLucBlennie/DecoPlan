/**
 * DecoPlan – Gradient Factors par défaut selon le type de plongée :
 * circuit ouvert à l'air, circuit ouvert au trimix (hélium dans un gaz de fond) ou recycleur (CCR).
 */

import type { Plongee } from './types';

export interface GfPair {
  gfLow: number;
  gfHigh: number;
}

export interface GfPreferences {
  /** Circuit ouvert, sans hélium */
  gfLow: number;
  gfHigh: number;
  /** Circuit ouvert, avec hélium dans un gaz de fond */
  gfLowTrimix: number;
  gfHighTrimix: number;
  /** Recycleur */
  gfLowCcr: number;
  gfHighCcr: number;
}

export type GfProfileKind = 'air' | 'trimix' | 'ccr';

export function gfProfileKind(plongee: Pick<Plongee, 'ccrDiluentName' | 'gazFond'>): GfProfileKind {
  if (plongee.ccrDiluentName !== undefined) return 'ccr';
  return plongee.gazFond.some(g => g.fHe > 0) ? 'trimix' : 'air';
}

/** Couple de GF des préférences adapté au type de la plongée. */
export function defaultGfFor(
  prefs: GfPreferences,
  plongee: Pick<Plongee, 'ccrDiluentName' | 'gazFond'>,
): GfPair {
  switch (gfProfileKind(plongee)) {
    case 'ccr':    return { gfLow: prefs.gfLowCcr,    gfHigh: prefs.gfHighCcr };
    case 'trimix': return { gfLow: prefs.gfLowTrimix, gfHigh: prefs.gfHighTrimix };
    default:       return { gfLow: prefs.gfLow,       gfHigh: prefs.gfHigh };
  }
}
