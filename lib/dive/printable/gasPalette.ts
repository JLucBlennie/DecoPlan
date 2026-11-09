/**
 * DecoPlan – Fiche imprimable : couleurs des gaz
 *
 * Le rouge disparaît dès quelques mètres sous l'eau : la palette n'en contient pas.
 * Chaque couleur est associée à un texte noir ou blanc de contraste suffisant (> 7:1).
 * Le vert est réservé aux lignes « changer de gaz ».
 */

export interface RunSheetColors {
  background: string;
  text: string;
}

/** Ligne à la fin de laquelle il faut changer de gaz. */
export const SWITCH_COLORS: RunSheetColors = { background: '#00B050', text: '#000000' };

/** Dans l'ordre de première utilisation : gaz de fond, puis gaz de déco. */
const GAS_COLORS: readonly RunSheetColors[] = [
  { background: '#FFC000', text: '#000000' }, // orange : gaz de fond (template)
  { background: '#2F5597', text: '#FFFFFF' }, // bleu : 1er gaz de déco (template)
  { background: '#00B0F0', text: '#000000' }, // cyan
  { background: '#7030A0', text: '#FFFFFF' }, // violet
  { background: '#BFBFBF', text: '#000000' }, // gris
];

/**
 * Associe une couleur à chaque gaz, dans l'ordre où les noms sont fournis (le gaz de fond
 * du runtime nominal vient en premier). Le même gaz garde la même couleur sur toute la fiche.
 * Au-delà de cinq gaz, les couleurs se répètent.
 */
export function assignGasColors(gasNames: Iterable<string>): Map<string, RunSheetColors> {
  const colors = new Map<string, RunSheetColors>();
  for (const name of gasNames) {
    if (!colors.has(name)) {
      colors.set(name, GAS_COLORS[colors.size % GAS_COLORS.length]);
    }
  }
  return colors;
}
