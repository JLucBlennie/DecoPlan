/**
 * DecoPlan – WhatIf : construction d'une DiveDefinition depuis une Plongee
 *
 * Point d'entrée unique pour l'écran de calcul : le runtime nominal et tous
 * les WhatIf partent de la même définition.
 */

import { ZH16CTissues } from '../buhlmann';
import { Gas } from '../gas';
import type { BailoutLimits } from '../ccr/bailoutCheck';
import type { CcrDefinition } from '../ccr/types';
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
  /** Réglages CCR (préférences) : utilisés seulement si la plongée a un diluant. */
  ccr?: CcrSettings;
}

/** Préférences CCR et hypothèses de bail-out. */
export interface CcrSettings {
  setpointLowBar: number;
  setpointHighBar: number;
  switchDepthM: number;
  /** RMV de bail-out (L/min). */
  bailoutRmvLMin: number;
}

/** Bloc supposé pour chaque gaz de bail-out (comme le mode pédagogique : 7 L / 200 bar). */
const BAILOUT_TANK = { volumeL: 7, pressureBar: 200 };

function ccrDefinitionOf(plongee: Plongee, settings: DiveSettings): CcrDefinition | undefined {
  if (!plongee.ccrDiluentName) return undefined;
  if (!settings.ccr) {
    throw new Error('Les plongées en recycleur ne sont pas encore prises en charge dans ce mode.');
  }
  return {
    config: {
      diluentName: plongee.ccrDiluentName,
      setpointLowBar: settings.ccr.setpointLowBar,
      setpointHighBar: settings.ccr.setpointHighBar,
      switchDepthM: settings.ccr.switchDepthM,
    },
    bailoutRmvLMin: settings.ccr.bailoutRmvLMin,
    bailoutTank: BAILOUT_TANK,
  };
}

/** Limites de PpO₂ (bar) : fond = avertissements WhatIf, déco = choix des gaz de déco. */
const MAX_BOTTOM_PPO2_BAR = 1.4;
const MAX_DECO_PPO2_BAR = 1.6;
const MAX_END_M = 30;
const TIME_STEP_MIN = 1;

/** Limites utilisées pour choisir (et vérifier) les gaz de bail-out. */
export const BAILOUT_LIMITS: BailoutLimits = {
    maxPpO2Bar: MAX_DECO_PPO2_BAR,
    maxEndM: MAX_END_M,
    isFreshWater: false,
};

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
    ccr: ccrDefinitionOf(plongee, settings),
  };
}
