/**
 * DecoPlan – WhatIf : types
 *
 * Formes de données uniquement, aucune logique.
 */

import type { TissueCoefficient } from '../buhlmann';
import type { Gas } from '../gas';
import type { Segment } from '../types';

/** Scénarios disponibles. NOMINAL est la plongée de référence. */
export type WhatIfKind =
  | 'NOMINAL'
  | 'LOST_DECO_GAS'
  | 'DEEPER'
  | 'LONGER'
  | 'SHORT_BOTTOM';

/**
 * Tout ce qu'il faut pour recalculer un runtime de A à Z.
 * Les scénarios en produisent des copies modifiées : l'original n'est jamais muté.
 */
export interface DiveDefinition {
  tissueTable: TissueCoefficient[];
  absPressureBar: number;
  isFreshWater: boolean;
  bottomGases: Gas[];
  decoGases: Gas[];
  /** Segments saisis par l'utilisateur (descente + fond), SANS la décompression. */
  bottomSegments: Segment[];
  gfLow: number;
  gfHigh: number;
  /** PpO₂ max pendant la phase fond (ex. 1.4), sert aux avertissements. */
  maxBottomPpO2: number;
  /** PpO₂ max en déco (ex. 1.6). */
  maxDecoPpO2: number;
  maxEndM: number;
  ascentRateMpm: number;
  ascentRateBetweenStopsMpm: number;
  timeStepMin: number;
}

/** Paramètres des scénarios (valeurs par défaut : voir scenarios.ts). */
export interface WhatIfOptions {
  deeperByM: number;
  longerByMin: number;
  shortBottomTimeMin: number;
}

export interface RuntimeStop {
  depthM: number;
  durationMin: number;
  gasName: string;
}

export interface RuntimeSummary {
  totalTimeMin: number;
  maxDepthM: number;
  /** Durée de la phase saisie (descente + fond), avant la remontée. */
  bottomPhaseMin: number;
  /** Temps de remontée total jusqu'à la surface (TTS), paliers compris. */
  ttsMin: number;
  /** Somme des paliers uniquement. */
  decoTimeMin: number;
  firstStopDepthM: number;
  stops: RuntimeStop[];
}

/** Écart par rapport au runtime nominal (positif = plus long / plus profond). */
export interface RuntimeDelta {
  totalTimeMin: number;
  ttsMin: number;
  decoTimeMin: number;
  firstStopDepthM: number;
}

export interface WhatIfRuntime {
  kind: WhatIfKind;
  label: string;
  segments: Segment[];
  summary: RuntimeSummary;
  warnings: string[];
  /** Absent pour le nominal. */
  delta?: RuntimeDelta;
}

export interface WhatIfResult {
  nominal: WhatIfRuntime;
  scenarios: WhatIfRuntime[];
}
