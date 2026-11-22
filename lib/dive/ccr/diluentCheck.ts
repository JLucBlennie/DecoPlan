/**
 * DecoPlan – CCR : le diluant convient-il à la profondeur de la plongée ?
 *
 * Fonction pure pour le formulaire de plongée. Trois contrôles à la profondeur max :
 *  - ppO₂ du diluant au-dessus du set point haut : la boucle ne peut plus tenir le set point ;
 *  - END du diluant au-dessus de la limite : narcose trop forte ;
 *  - diluant hypoxique (< 16 % d'O₂) : à ne pas respirer en surface (information).
 * Si le diluant est trop riche ou trop narcotique, un mélange conseillé est calculé.
 */

import type { Gas } from '../gas';
import { depthInMetersToBars } from '../physics';

export interface DiluentLimits {
  /** Set point haut (bar de ppO₂) : borne haute de ppO₂ du diluant au fond. */
  setpointHighBar: number;
  /** END max (m) du diluant. */
  maxEndM: number;
  isFreshWater: boolean;
}

export interface DiluentMessage {
  level: 'warning' | 'info';
  text: string;
}

export interface DiluentSuggestion {
  /** Pourcentages entiers. */
  o2Percent: number;
  hePercent: number;
  name: string;
}

export interface DiluentAdvice {
  messages: DiluentMessage[];
  suggestion?: DiluentSuggestion;
}

const HYPOXIC_FO2 = 0.16;

const f = (value: number, digits = 2) => value.toFixed(digits);

/** Mélange conseillé : O₂ au plus haut qui respecte le set point, hélium pour tenir l'END. */
function suggestMix(depthM: number, limits: DiluentLimits): DiluentSuggestion | undefined {
  const pAmb = depthInMetersToBars(depthM, limits.isFreshWater);
  const pEnd = depthInMetersToBars(limits.maxEndM, limits.isFreshWater);

  const o2Percent = Math.floor((limits.setpointHighBar / pAmb) * 100);
  // Narcotiques : O₂ + N₂ = 1 − He → (1 − fHe) × Pamb ≤ Pend
  const hePercent = Math.max(0, Math.ceil((1 - pEnd / pAmb) * 100));
  if (o2Percent < 5 || o2Percent + hePercent > 100) return undefined;

  return { o2Percent, hePercent, name: `${o2Percent}/${hePercent}` };
}

/** Analyse d'un diluant à la profondeur `depthM` (profondeur max de la plongée). */
export function diluentAdvice(diluent: Gas, depthM: number, limits: DiluentLimits): DiluentAdvice {
  const messages: DiluentMessage[] = [];
  if (depthM <= 0) return { messages };

  let needsSuggestion = false;

  const ppO2 = diluent.ppO2AtDepth(depthM, limits.isFreshWater);
  if (ppO2 > limits.setpointHighBar) {
    needsSuggestion = true;
    messages.push({
      level: 'warning',
      text: `Diluant ${diluent.name} trop riche : ppO₂ ${f(ppO2)} bar à ${Math.round(depthM)} m, au-dessus du set point haut (${f(limits.setpointHighBar)} bar). La boucle ne pourra pas tenir le set point.`,
    });
  }

  const end = Math.round(diluent.endInMeters(depthM, limits.isFreshWater));
  if (end > limits.maxEndM) {
    needsSuggestion = true;
    messages.push({
      level: 'warning',
      text: `Diluant ${diluent.name} trop narcotique : END ${end} m à ${Math.round(depthM)} m, au-dessus de ${limits.maxEndM} m.`,
    });
  }

  if (diluent.fO2 < HYPOXIC_FO2) {
    messages.push({
      level: 'info',
      text: `Diluant ${diluent.name} hypoxique (${Math.round(diluent.fO2 * 100)} % d'O₂) : ne pas le respirer en surface ni en faible profondeur.`,
    });
  }

  if (!needsSuggestion) return { messages };
  return { messages, suggestion: suggestMix(depthM, limits) };
}
