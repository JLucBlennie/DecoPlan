/**
 * DecoPlan – Gradient Factors par défaut selon le type de plongée (circuit ouvert ou CCR).
 */

export interface GfPair {
  gfLow: number;
  gfHigh: number;
}

export interface GfPreferences {
  gfLow: number;
  gfHigh: number;
  gfLowCcr: number;
  gfHighCcr: number;
}

/** Couple de GF des préférences pour une plongée en recycleur (`isCcr`) ou en circuit ouvert. */
export function defaultGfFor(prefs: GfPreferences, isCcr: boolean): GfPair {
  return isCcr
    ? { gfLow: prefs.gfLowCcr, gfHigh: prefs.gfHighCcr }
    : { gfLow: prefs.gfLow, gfHigh: prefs.gfHigh };
}
