/**
 * DecoPlan – Fiche imprimable : lignes d'un runtime
 *
 * Même structure que le template Excel : Niveau / Rem. / Palier, avec
 *   Durée   = temps passé depuis la ligne précédente (remontée entre paliers comprise)
 *   Runtime = temps écoulé depuis le départ, à la FIN de la ligne
 * donc Runtime = Runtime précédent + Durée, à la seconde près.
 */

import { isAscent, isDecoStop } from '../segment';
import type { Segment } from '../types';

export type RunSheetPhase = 'LEVEL' | 'ASCENT' | 'STOP' | 'SURFACE';

export interface RunSheetRow {
  phase: RunSheetPhase;
  /** Niveau : profondeur du niveau. Rem. : profondeur atteinte. Palier : profondeur du palier. */
  depthM: number;
  /** null : durée non affichée (1er niveau, identique au runtime). */
  durationSec: number | null;
  runtimeSec: number;
  gasName: string;
  /** Gaz à respirer à partir de la fin de cette ligne, s'il change : ligne « changer de gaz ». */
  switchToGas?: string;
  /** Vrai pour la première ligne respirée sur un nouveau gaz. */
  startsGas: boolean;
}

/** Une ligne en cours de construction : fin en minutes (flottant), arrondie ensuite. */
interface RawRow {
  phase: RunSheetPhase;
  depthM: number;
  endMin: number;
  gasName: string;
}

const EPSILON_MIN = 1e-6;

/** Nombre de segments qui appartiennent à la phase saisie (descente + fond), avant la remontée. */
function countBottomSegments(segments: Segment[], bottomPhaseMin: number): number {
  let elapsed = 0;
  let count = 0;
  for (const seg of segments) {
    if (elapsed + seg.time > bottomPhaseMin + EPSILON_MIN) break;
    elapsed += seg.time;
    count++;
  }
  return count;
}

/** Temps cumulé (minutes) à la fin de chaque segment. */
function cumulativeEnds(segments: Segment[]): number[] {
  let elapsed = 0;
  return segments.map(seg => (elapsed += seg.time));
}

/** Phase saisie : chaque transition est fusionnée avec le niveau plat qui la suit. */
function levelRows(segments: Segment[], ends: number[], count: number): RawRow[] {
  const rows: RawRow[] = [];
  let i = 0;
  while (i < count) {
    const seg = segments[i];
    const next = i + 1 < count ? segments[i + 1] : undefined;
    const levelEnds = !isDecoStop(seg) && next && isDecoStop(next) && next.startDepth === seg.endDepth;
    const last = levelEnds ? i + 1 : i;
    rows.push({ phase: 'LEVEL', depthM: seg.endDepth, endMin: ends[last], gasName: segments[last].gasName });
    i = last + 1;
  }
  return rows;
}

/**
 * Remontée : une ligne par palier, une ligne « Rem. » quand le gaz change en route,
 * une ligne « Surf. » à l'arrivée. La remontée entre deux paliers est absorbée par le palier.
 */
function ascentRows(segments: Segment[], ends: number[], from: number): RawRow[] {
  const rows: RawRow[] = [];
  let i = from;
  while (i < segments.length) {
    const seg = segments[i];

    if (!isAscent(seg)) {
      if (seg.startDepth > 0) {
        rows.push({ phase: 'STOP', depthM: seg.startDepth, endMin: ends[i], gasName: seg.gasName });
      }
      i++;
      continue;
    }

    // Remontées consécutives sur le même gaz : un seul trajet.
    let last = i;
    while (last + 1 < segments.length && isAscent(segments[last + 1]) && segments[last + 1].gasName === seg.gasName) {
      last++;
    }
    const arrival = segments[last].endDepth;
    const next = segments[last + 1];
    const arrivesAtStopOnSameGas =
      next !== undefined && isDecoStop(next) && next.startDepth === arrival && next.gasName === seg.gasName;

    if (arrival === 0) {
      rows.push({ phase: 'SURFACE', depthM: 0, endMin: ends[last], gasName: seg.gasName });
    } else if (!arrivesAtStopOnSameGas) {
      rows.push({ phase: 'ASCENT', depthM: arrival, endMin: ends[last], gasName: seg.gasName });
    }
    i = last + 1;
  }
  return rows;
}

export function buildRunSheetRows(segments: Segment[], bottomPhaseMin: number): RunSheetRow[] {
  const ends = cumulativeEnds(segments);
  const bottomCount = countBottomSegments(segments, bottomPhaseMin);

  const raw = [
    ...levelRows(segments, ends, bottomCount),
    ...ascentRows(segments, ends, bottomCount),
  ];

  // Durées = différences des runtimes arrondis : Runtime = précédent + Durée, sans écart d'arrondi.
  let previousRuntimeSec = 0;
  const rows: RunSheetRow[] = raw.map((row, index) => {
    const runtimeSec = Math.round(row.endMin * 60);
    const durationSec = index === 0 && row.phase === 'LEVEL' ? null : runtimeSec - previousRuntimeSec;
    previousRuntimeSec = runtimeSec;
    return {
      phase: row.phase,
      depthM: row.depthM,
      durationSec,
      runtimeSec,
      gasName: row.gasName,
      startsGas: false,
    };
  });

  for (let i = 0; i + 1 < rows.length; i++) {
    if (rows[i + 1].gasName !== rows[i].gasName) {
      rows[i].switchToGas = rows[i + 1].gasName;
      rows[i + 1].startsGas = true;
    }
  }

  return rows;
}
