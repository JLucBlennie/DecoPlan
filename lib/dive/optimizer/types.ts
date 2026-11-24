/**
 * DecoPlan – Optimisation : types
 *
 * Formes de données uniquement, aucune logique.
 */

import type { Gas } from '../gas';
import type { Plongee } from '../types';
import type { DiveDefinition, GasReserves, RuntimeSummary } from '../whatIf/types';

/** Bloc de gaz : taille, pression de gonflage et nombre de blocs emportés. */
export interface BlockSpec {
  volumeL: number;
  pressureBar: number;
  count: number;
}

/** Critères de la recherche : ce que l'utilisateur emporte et ce qu'il s'impose. */
export interface OptimizerCriteria {
  depthM: number;
  bottomGas: Gas;
  decoGases: Gas[];
  bottomBlock: BlockSpec;
  /** Même type de bloc pour chaque gaz de déco (`count` blocs par gaz). */
  decoBlock: BlockSpec;
  reserves: GasReserves;
  /** Durée maximale de déco (somme des paliers), en minutes. Absent = pas de limite. */
  maxDecoTimeMin?: number;
  /** Profondeur maximale du 1er palier (m). Absent = pas de limite. */
  maxFirstStopDepthM?: number;
}

/** Ce qui empêche d'allonger le temps de fond. */
export type LimitingFactor =
  | { kind: 'bottom-gas' }
  | { kind: 'deco-gas'; gasName: string }
  | { kind: 'deco-time' }
  | { kind: 'first-stop' }
  | { kind: 'search-cap' };

/** Gaz nécessaire face au gaz disponible (réserve déduite) pour un gaz donné. */
export interface GasBudget {
  gasName: string;
  role: 'bottom' | 'deco';
  neededL: number;
  availableL: number;
  /** Pression restante dans les blocs à la fin du runtime, réserve comprise. */
  remainingBar: number;
  /** Vrai si le besoin dépasse le disponible. */
  exceeded: boolean;
}

/** Résultat de l'évaluation d'un temps de fond donné. */
export interface BottomTimeEvaluation {
  bottomTimeMin: number;
  definition: DiveDefinition;
  summary: RuntimeSummary;
  budgets: GasBudget[];
  /** Facteurs dépassés ; vide = ce temps de fond est faisable. */
  violations: LimitingFactor[];
}

export interface OptimizerResult {
  /** Faux si même le temps de fond minimum ne tient pas. */
  feasible: boolean;
  /** Dernière évaluation retenue : le plus long temps de fond faisable (ou le minimum si infaisable). */
  evaluation: BottomTimeEvaluation;
  /** Ce qui bloque le temps suivant (`search-cap` si rien ne bloque avant la limite de recherche). */
  limiting: LimitingFactor[];
  /** Plongée correspondant au résultat, prête à être calculée ou enregistrée. */
  plongee: Plongee;
}
