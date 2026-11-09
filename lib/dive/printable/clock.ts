/**
 * DecoPlan – Fiche imprimable : format mm:ss
 */

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Secondes → « mm:ss », minutes NON limitées à 59 (un runtime de 83 min s'écrit « 83:20 »,
 * contrairement au format de cellule « mm:ss » d'Excel qui repart de zéro après une heure).
 */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  return `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`;
}
