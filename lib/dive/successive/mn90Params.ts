/**
 * DecoPlan – Plongées successives : paramètres MN90 d'une plongée Bühlmann
 *
 * Même convention que getMN90Profile : profondeur max, et temps de plongée = temps
 * écoulé depuis la surface jusqu'à la fin du dernier palier de fond (≥ 90 % de la
 * profondeur max), descente comprise.
 */

import type { MN90DiveParameters } from '../mn90';
import type { Segment } from '../types';

export function mn90ParametersFromSegments(bottomSegments: Segment[]): MN90DiveParameters {
  const maxDepthM = Math.max(0, ...bottomSegments.map(s => Math.max(s.startDepth, s.endDepth)));

  let elapsed = 0;
  let diveTimeMin = 0;
  for (const s of bottomSegments) {
    elapsed += s.time;
    if (s.startDepth === s.endDepth && s.startDepth >= maxDepthM * 0.9) diveTimeMin = elapsed;
  }
  return { maxDepthM, diveTimeMin };
}
