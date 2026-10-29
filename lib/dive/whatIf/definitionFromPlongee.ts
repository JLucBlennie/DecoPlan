/**
 * DecoPlan – WhatIf : construction d'une DiveDefinition depuis une Plongee
 *
 * Point d'entrée unique pour l'écran de calcul : le runtime nominal et tous
 * les WhatIf partent de la même définition.
 */

import { ZH16CTissues } from '../buhlmann';
import { Gas } from '../gas';
import type { Plongee } from '../types';
import { expandPlongeeSegments } from './bottomSegmentsFromPlongee';
import type { DiveDefinition } from './types';

/** Réglages de calcul : GF de l'écran + vitesses des préférences. */
export interface DiveSettings {
  gfLow: number;
  gfHigh: number;
  descentRateMMin: number;
  /** Vitesse de remontée du fond jusqu'au 1er palier (m/min). */
  ascentRateMMin: number;
  /** Vitesse entre paliers et jusqu'à la surface (m/min). */
  ascentRateBetweenStopsMMin: number;
}

/** Limites de PpO₂ (bar) : fond = avertissements WhatIf, déco = choix des gaz de déco. */
const MAX_BOTTOM_PPO2_BAR = 1.4;
const MAX_DECO_PPO2_BAR = 1.6;
const MAX_END_M = 30;
const TIME_STEP_MIN = 1;

export function definitionFromPlongee(plongee: Plongee, settings: DiveSettings): DiveDefinition {
  return {
    tissueTable: ZH16CTissues,
    absPressureBar: 1,
    isFreshWater: false,
    bottomGases: plongee.gazFond.map(Gas.fromJSON),
    decoGases: plongee.gazDeco.map(Gas.fromJSON),
    bottomSegments: expandPlongeeSegments(plongee.segments, settings),
    gfLow: settings.gfLow,
    gfHigh: settings.gfHigh,
    maxBottomPpO2: MAX_BOTTOM_PPO2_BAR,
    maxDecoPpO2: MAX_DECO_PPO2_BAR,
    maxEndM: MAX_END_M,
    ascentRateMpm: settings.ascentRateMMin,
    ascentRateBetweenStopsMpm: settings.ascentRateBetweenStopsMMin,
    timeStepMin: TIME_STEP_MIN,
  };
}
