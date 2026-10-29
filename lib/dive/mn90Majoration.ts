/**
 * Table MN90 — majoration (minutes) à ajouter au temps de la 2e plongée.
 *
 * Source : fichier tableMajoration.mn90 fourni par l'utilisateur.
 * Lecture : ligne = azote résiduel (bar), colonne = profondeur de la 2e plongée (m).
 */

/** Profondeurs (mètres) des colonnes de la table. */
export const MN90_MAJORATION_DEPTHS_M: readonly number[] = [12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60];

export interface Mn90MajorationRow {
  /** Azote résiduel (bar) de la ligne. */
  n2: number;
  /** Majoration (min) pour chaque profondeur de MN90_MAJORATION_DEPTHS_M. */
  minutes: readonly number[];
}

/** Lignes triées par azote résiduel croissant. */
export const MN90_MAJORATION_ROWS: readonly Mn90MajorationRow[] = [
  { n2: 0.82, minutes: [4, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  { n2: 0.84, minutes: [7, 6, 5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1] },
  { n2: 0.86, minutes: [11, 9, 7, 7, 6, 5, 5, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2] },
  { n2: 0.89, minutes: [17, 13, 11, 10, 9, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 4, 4, 3, 3] },
  { n2: 0.92, minutes: [23, 18, 15, 13, 12, 11, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5, 5, 5, 5, 4] },
  { n2: 0.95, minutes: [29, 23, 19, 17, 15, 13, 12, 11, 10, 10, 9, 8, 8, 7, 7, 7, 6, 6, 6, 5] },
  { n2: 0.99, minutes: [38, 30, 24, 22, 20, 17, 15, 14, 13, 12, 11, 11, 10, 9, 9, 8, 8, 8, 7, 7] },
  { n2: 1.03, minutes: [47, 37, 30, 27, 24, 21, 19, 17, 16, 15, 14, 13, 12, 11, 11, 10, 10, 9, 9, 9] },
  { n2: 1.07, minutes: [57, 44, 36, 32, 29, 25, 22, 21, 19, 18, 16, 15, 15, 13, 13, 12, 12, 11, 10, 10] },
  { n2: 1.11, minutes: [68, 52, 42, 37, 34, 29, 26, 24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 13, 12, 12] },
  { n2: 1.16, minutes: [81, 62, 50, 44, 40, 34, 30, 28, 26, 24, 22, 21, 20, 18, 17, 16, 16, 15, 14, 13] },
  { n2: 1.2, minutes: [93, 70, 56, 50, 45, 39, 34, 32, 29, 27, 24, 23, 22, 20, 19, 18, 18, 17, 16, 15] },
  { n2: 1.24, minutes: [106, 79, 63, 56, 50, 43, 38, 35, 33, 30, 27, 26, 24, 23, 21, 20, 19, 18, 17, 17] },
  { n2: 1.29, minutes: [124, 91, 72, 63, 56, 49, 43, 40, 37, 33, 30, 29, 27, 25, 24, 23, 22, 20, 19, 19] },
  { n2: 1.33, minutes: [139, 101, 79, 70, 62, 53, 47, 43, 40, 36, 33, 31, 30, 28, 26, 25, 24, 22, 21, 20] },
  { n2: 1.38, minutes: [160, 114, 89, 78, 69, 59, 52, 48, 44, 40, 37, 35, 33, 30, 28, 27, 26, 24, 23, 22] },
  { n2: 1.42, minutes: [180, 126, 97, 85, 75, 64, 56, 52, 48, 43, 39, 37, 35, 33, 30, 29, 28, 26, 25, 24] },
  { n2: 1.45, minutes: [196, 135, 104, 90, 80, 68, 59, 55, 51, 46, 42, 39, 37, 34, 32, 31, 29, 28, 26, 25] },
];
