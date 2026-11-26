/**
 * DecoPlan – Paramètres de table d'une plongée saisie (MN90, DCIEM)
 *
 * Les segments reçus sont ceux saisis par l'opérateur, SANS la décompression
 * calculée : la profondeur est la plus grande atteinte, le temps de plongée est la
 * durée totale de ces niveaux depuis la surface, descente comprise (convention MN90).
 * Aucun seuil de profondeur : tout ce qui est saisi fait partie de la plongée.
 */

import type { MN90DiveParameters } from '../mn90';
import type { Segment } from '../types';

export function mn90ParametersFromSegments(bottomSegments: Segment[]): MN90DiveParameters {
  const maxDepthM = Math.max(0, ...bottomSegments.map(s => Math.max(s.startDepth, s.endDepth)));
  const diveTimeMin = bottomSegments.reduce((sum, s) => sum + s.time, 0);
  return { maxDepthM, diveTimeMin };
}
