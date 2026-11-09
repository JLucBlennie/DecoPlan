/**
 * DecoPlan – Plongées successives : types
 *
 * Formes de données uniquement, aucune logique.
 */

import type { DiveDefinition, RuntimeSummary } from '../whatIf';
import type { MN90SuccessiveResult } from '../mn90Successive';
import type { Segment } from '../types';

/** Pressions tissulaires (bar) d'un compartiment, à un instant donné. */
export interface TissueState {
  pNitrogen: number;
  pHelium: number;
}

export interface SuccessiveDiveInput {
  first: DiveDefinition;
  second: DiveDefinition;
  /** Intervalle surface entre la sortie de l'eau et la remise à l'eau (min). */
  surfaceIntervalMin: number;
}

/** Une plongée calculée : segments complets (fond + déco) et résumé. */
export interface ComputedDive {
  segments: Segment[];
  summary: RuntimeSummary;
}

/** Charge en azote d'un compartiment pendant l'intervalle surface. */
export interface CompartmentDesaturation {
  halfTimeMin: number;
  /** Pression d'azote à la sortie de l'eau (fin de la plongée 1). */
  n2AfterDive1Bar: number;
  /** Pression d'azote à la remise à l'eau (fin de l'intervalle). */
  n2AtSecondDiveBar: number;
  /** Pression d'azote à saturation en surface, à l'air. */
  n2SurfaceSaturationBar: number;
}

export interface SuccessiveResult {
  surfaceIntervalMin: number;
  first: ComputedDive;
  /** 2e plongée calculée avec les tissus encore chargés par la 1re. */
  second: ComputedDive;
  /** Même 2e plongée partie de tissus saturés en surface : sert de référence. */
  secondAlone: ComputedDive;
  desaturation: CompartmentDesaturation[];
  /** Lecture des tables MN90 pour la même paire de plongées. */
  mn90: MN90SuccessiveResult;
}

/** Un point de la courbe « effet de l'intervalle » sur la 2e plongée. */
export interface IntervalSweepPoint {
  surfaceIntervalMin: number;
  secondTtsMin: number;
  secondDecoTimeMin: number;
  /** TTS de la 2e plongée lue en MN90 (undefined : hors table). */
  mn90SecondTtsMin: number | undefined;
}
