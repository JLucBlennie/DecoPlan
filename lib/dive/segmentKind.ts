/**
 * DecoPlan – Classification d'un segment pour l'affichage des runtimes
 */

import type { Segment } from './types';

export type SegmentKind = 'descent' | 'bottom' | 'ascent' | 'deco';

/** Un niveau plat à au moins 85 % de la profondeur max est un « fond », sinon un « palier ». */
const BOTTOM_DEPTH_RATIO = 0.85;

export function classifySegment(seg: Segment, maxDepth: number): SegmentKind {
  if (seg.endDepth > seg.startDepth) return 'descent';
  if (seg.endDepth < seg.startDepth) return 'ascent';
  return seg.startDepth >= maxDepth * BOTTOM_DEPTH_RATIO ? 'bottom' : 'deco';
}
