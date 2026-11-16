/**
 * DecoPlan – WhatIf : segments de la phase fond tels qu'ils sont réellement joués.
 *
 * En circuit ouvert : les segments saisis. En CCR : les mêmes, découpés aux
 * changements de set point et portant leur set point.
 */

import { applySetpoints } from '../ccr/setpointProfile';
import type { Segment } from '../types';
import type { DiveDefinition } from './types';

export function bottomSegmentsOf(def: DiveDefinition): Segment[] {
  return def.ccr ? applySetpoints(def.bottomSegments, def.ccr.config) : def.bottomSegments;
}
