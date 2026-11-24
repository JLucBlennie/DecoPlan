/**
 * DecoPlan – WhatIf : types
 *
 * Formes de données uniquement, aucune logique.
 */

import type { TissueCoefficient } from '../buhlmann';
import type { Gas } from '../gas';
import type { Segment } from '../types';
import type { CcrDefinition } from '../ccr/types';
import type { GasUsage } from '../ccr/bailoutGas';
import type { BlockSuggestion } from '../gasBlocks';

/** Scénarios disponibles. NOMINAL est la plongée de référence. */
export type WhatIfKind =
  | 'NOMINAL'
  | 'LOST_DECO_GAS'
  | 'DEEPER'
  | 'LONGER'
  | 'SHORT_BOTTOM'
  | 'BAILOUT';

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
  /** Présent = plongée en recycleur (CCR). Absent = circuit ouvert. */
  ccr?: CcrDefinition;
  /** RMV (L/min) pour estimer les gaz nécessaires ; absent = pas d'estimation. */
  rmv?: { fondLMin: number; decoLMin: number };
  /** Réserve (bar) gardée dans les blocs ; absent = aucune réserve. Le bail-out suit la réserve déco. */
  gasReserves?: GasReserves;
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

/** Réserves de pression (bar) à garder dans les blocs. */
export interface GasReserves {
  bottomBar: number;
  decoBar: number;
}

export type RuntimeGasRole = 'bottom' | 'deco' | 'bailout';

/** Gaz nécessaire pour aller au bout du runtime, avec les blocs proposés. */
export interface RuntimeGasNeed {
  gasName: string;
  role: RuntimeGasRole;
  /** Litres détendus nécessaires, réserve non comprise. */
  litres: number;
  /** Réserve (bar) prise en compte pour dimensionner les blocs. */
  reserveBar: number;
  /** Une proposition par taille de bloc considérée. */
  options: BlockSuggestion[];
  /** Proposition la plus économe parmi `options`. */
  best: BlockSuggestion;
}

export interface WhatIfRuntime {
  kind: WhatIfKind;
  label: string;
  segments: Segment[];
  summary: RuntimeSummary;
  warnings: string[];
  /** Consommation de gaz (bail-out seulement). */
  gasUsage?: GasUsage[];
  /** Gaz nécessaires et blocs conseillés (absent si inconnus : recycleur sans bail-out, RMV non fournis). */
  gasNeeds?: RuntimeGasNeed[];
  /** Absent pour le nominal. */
  delta?: RuntimeDelta;
}

/** Scénario qui n'a pas pu être calculé (ex. bail-out sans gaz respirable en fin de fond). */
export interface WhatIfUnavailable {
  kind: WhatIfKind;
  label: string;
  reason: string;
}

export interface WhatIfResult {
  nominal: WhatIfRuntime;
  scenarios: WhatIfRuntime[];
  /** Scénarios non calculables : le reste du résultat reste valable. */
  unavailable: WhatIfUnavailable[];
}
