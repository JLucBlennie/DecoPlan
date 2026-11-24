/**
 * DecoPlan – Optimisation : plongée candidate pour un temps de fond donné.
 */

import type { Plongee, Segment } from '../types';
import type { OptimizerCriteria } from './types';

/** Un seul niveau : profondeur visée, temps de fond transition comprise (convention MN90). */
export function candidatePlongee(criteria: OptimizerCriteria, bottomTimeMin: number, name: string): Plongee {
  const level: Segment = {
    startDepth: 0,
    endDepth: criteria.depthM,
    gasName: criteria.bottomGas.name,
    time: bottomTimeMin,
  };
  return {
    id: '',
    name,
    segments: [level],
    gazFond: [criteria.bottomGas],
    gazDeco: criteria.decoGases,
  };
}
