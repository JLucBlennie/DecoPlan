// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — MN90 plongées successives : lectures dans les tables
//
// Deux lectures, toujours dans le sens de la prudence :
//   1. azote résiduel   : GPS de la plongée 1 × intervalle en surface
//                         (intervalle arrondi à la colonne immédiatement INFÉRIEURE)
//   2. majoration (min) : azote résiduel × profondeur de la plongée 2
//                         (azote arrondi à la ligne SUPÉRIEURE, profondeur à la colonne SUPÉRIEURE)
// ─────────────────────────────────────────────────────────────────────────────
import { MN90_MAJORATION_DEPTHS_M, MN90_MAJORATION_ROWS } from './mn90Majoration';
import { MN90_RESIDUAL_INTERVALS_MIN, MN90_RESIDUAL_N2 } from './mn90Residual';

/** En dessous de cet intervalle (min) : plongées consécutives, traitées comme une seule. */
export const MN90_CONSECUTIVE_BELOW_MIN: number = MN90_RESIDUAL_INTERVALS_MIN[0];

/** À partir de cet intervalle (min) : plongées indépendantes (12 h), plus de résiduel. */
export const MN90_INDEPENDENT_FROM_MIN: number =
  MN90_RESIDUAL_INTERVALS_MIN[MN90_RESIDUAL_INTERVALS_MIN.length - 1];

/** Azote tissulaire à saturation de surface (bar) : case vide de la table = plus de résiduel. */
const SURFACE_SATURATION_N2_BAR = 0.8;

const EPSILON = 1e-9;

export interface ResidualN2Reading {
  /** Colonne de la table réellement lue (min). */
  intervalColumnMin: number;
  residualN2: number;
}

/**
 * Azote résiduel (bar) après une plongée de groupe `gps` et `intervalMin` minutes en surface.
 * Retourne undefined si le GPS est inconnu ou l'intervalle inférieur à la 1re colonne.
 */
export function readResidualN2(gps: string, intervalMin: number): ResidualN2Reading | undefined {
  const values = MN90_RESIDUAL_N2[gps];
  if (!values) return undefined;

  let column = -1;
  MN90_RESIDUAL_INTERVALS_MIN.forEach((interval, i) => {
    if (interval <= intervalMin) column = i;
  });
  if (column < 0) return undefined;

  return {
    intervalColumnMin: MN90_RESIDUAL_INTERVALS_MIN[column],
    residualN2: values[column] ?? SURFACE_SATURATION_N2_BAR,
  };
}

export interface MajorationReading {
  /** Ligne de la table réellement lue (bar), null si l'azote est à saturation de surface. */
  n2RowBar: number | null;
  /** Colonne de profondeur réellement lue (m). */
  depthColumnM: number;
  majorationMin: number;
}

/**
 * Majoration (min) à ajouter au temps de la 2e plongée.
 * Une 2e plongée moins profonde que la 1re colonne (12 m) lit cette colonne.
 * Retourne undefined hors table : profondeur > 60 m ou azote résiduel > dernière ligne.
 */
export function readMajoration(residualN2: number, depthM: number): MajorationReading | undefined {
  const depths = MN90_MAJORATION_DEPTHS_M;
  const column = depths.findIndex(d => d >= Math.max(depthM, depths[0]));
  if (column < 0) return undefined;

  if (residualN2 <= SURFACE_SATURATION_N2_BAR + EPSILON) {
    return { n2RowBar: null, depthColumnM: depths[column], majorationMin: 0 };
  }

  const row = MN90_MAJORATION_ROWS.find(r => r.n2 >= residualN2 - EPSILON);
  if (!row) return undefined;

  return { n2RowBar: row.n2, depthColumnM: depths[column], majorationMin: row.minutes[column] };
}
