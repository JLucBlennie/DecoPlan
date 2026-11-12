/**
 * DecoPlan – CCR : affectation des set points sur le profil saisi.
 *
 * Descente : set point bas jusqu'à switchDepthM, puis haut.
 * Fond / palier : haut si au-delà de switchDepthM, bas sinon.
 * Remontée : haut (ou bas sous ascentLowSwitchDepthM si défini).
 */

import type { Segment } from '../types';
import { createSegment } from '../segment';
import { splitSegmentAtDepths } from './segmentSplit';
import type { CcrConfig } from './types';

export function setpointForPiece(
  startDepth: number,
  endDepth: number,
  cfg: CcrConfig,
): number {
  const mid = (startDepth + endDepth) / 2;
  if (endDepth > startDepth) {
    return mid < cfg.switchDepthM ? cfg.setpointLowBar : cfg.setpointHighBar;
  }
  if (endDepth < startDepth) {
    const low = cfg.ascentLowSwitchDepthM;
    return low !== undefined && mid <= low ? cfg.setpointLowBar : cfg.setpointHighBar;
  }
  return startDepth < cfg.switchDepthM ? cfg.setpointLowBar : cfg.setpointHighBar;
}

/**
 * Transforme des segments saisis en segments CCR (gasName = diluant, setpointBar renseigné),
 * découpés aux profondeurs de changement de set point.
 */
export function applySetpoints(segments: Segment[], cfg: CcrConfig): Segment[] {
  const cuts = [cfg.switchDepthM];
  if (cfg.ascentLowSwitchDepthM !== undefined) cuts.push(cfg.ascentLowSwitchDepthM);

  const result: Segment[] = [];
  for (const seg of segments) {
    const pieces = splitSegmentAtDepths(seg.startDepth, seg.endDepth, seg.time, cuts);
    for (const p of pieces) {
      result.push(createSegment(
        p.startDepth, p.endDepth, cfg.diluentName, p.time,
        setpointForPiece(p.startDepth, p.endDepth, cfg),
      ));
    }
  }
  return result;
}
