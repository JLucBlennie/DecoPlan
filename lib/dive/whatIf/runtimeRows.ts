/**
 * DecoPlan – WhatIf : lignes d'affichage d'un runtime
 */

import { maxDepth } from '../segment';
import { classifySegment, type SegmentKind } from '../segmentKind';
import type { Segment } from '../types';

export interface RuntimeRow {
  kind: SegmentKind;
  startDepthM: number;
  endDepthM: number;
  durationMin: number;
  /** Temps écoulé depuis le départ, à la fin de ce segment. */
  cumulativeMin: number;
  gasName: string;
  /** Vrai pour le premier segment et à chaque changement de gaz. */
  gasSwitch: boolean;
  /** Set point (bar) si le segment est en circuit fermé, sinon `undefined`. */
  setpointBar?: number;
  /** Vrai quand le set point (ou le passage CCR ↔ circuit ouvert) change. */
  setpointSwitch: boolean;
}

export function toRuntimeRows(segments: Segment[]): RuntimeRow[] {
  const deepest = maxDepth(segments);
  let cumulative = 0;
  let previousGas: string | undefined;
  let previousSetpoint: number | undefined;
  let first = true;

  return segments.map(seg => {
    cumulative += seg.time;
    const row: RuntimeRow = {
      kind: classifySegment(seg, deepest),
      startDepthM: seg.startDepth,
      endDepthM: seg.endDepth,
      durationMin: seg.time,
      cumulativeMin: cumulative,
      gasName: seg.gasName,
      gasSwitch: seg.gasName !== previousGas || (!first && (seg.setpointBar === undefined) !== (previousSetpoint === undefined)),
      setpointBar: seg.setpointBar,
      setpointSwitch: seg.setpointBar !== undefined && seg.setpointBar !== previousSetpoint,
    };
    previousGas = seg.gasName;
    previousSetpoint = seg.setpointBar;
    first = false;
    return row;
  });
}
