/**
 * DecoPlan – WhatIf : résumé d'un runtime et écarts avec le nominal
 */

import { isDecoStop, maxDepth, totalTime } from '../segment';
import type { Segment } from '../types';
import type { DiveDefinition, RuntimeDelta, RuntimeStop, RuntimeSummary } from './types';

export function summarizeRuntime(def: DiveDefinition, segments: Segment[]): RuntimeSummary {
  const bottomPhaseMin = totalTime(def.bottomSegments);
  const totalTimeMin = totalTime(segments);

  const stops: RuntimeStop[] = segments
    .slice(def.bottomSegments.length)
    .filter(s => isDecoStop(s) && s.startDepth > 0)
    .map(s => ({ depthM: s.startDepth, durationMin: s.time, gasName: s.gasName }));

  const decoTimeMin = stops.reduce((sum, s) => sum + s.durationMin, 0);

  return {
    totalTimeMin,
    maxDepthM: maxDepth(segments),
    bottomPhaseMin,
    ttsMin: totalTimeMin - bottomPhaseMin,
    decoTimeMin,
    firstStopDepthM: stops.length > 0 ? stops[0].depthM : 0,
    stops,
  };
}

export function deltaFromNominal(nominal: RuntimeSummary, other: RuntimeSummary): RuntimeDelta {
  return {
    totalTimeMin: other.totalTimeMin - nominal.totalTimeMin,
    ttsMin: other.ttsMin - nominal.ttsMin,
    decoTimeMin: other.decoTimeMin - nominal.decoTimeMin,
    firstStopDepthM: other.firstStopDepthM - nominal.firstStopDepthM,
  };
}
