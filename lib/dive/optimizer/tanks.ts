/**
 * DecoPlan – Optimisation : blocs du résultat, au format du mode pédagogique.
 *
 * Plusieurs blocs d'un même gaz (ex. 2 × 12 L) sont additionnés en un seul volume équivalent
 * (24 L) : la consommation et la pression restante se calculent comme pour un jumelé.
 */

import type { TankConfig } from '../buildDivePlan';
import type { BlockSpec, OptimizerCriteria } from './types';

const toTank = (gasName: string, block: BlockSpec): TankConfig => ({
  gasName,
  volumeLiters: block.volumeL * block.count,
  startPressureBar: block.pressureBar,
});

export function tanksFromCriteria(criteria: OptimizerCriteria): TankConfig[] {
  return [
    toTank(criteria.bottomGas.name, criteria.bottomBlock),
    ...criteria.decoGases
      .filter(g => criteria.decoBlocks[g.name])
      .map(g => toTank(g.name, criteria.decoBlocks[g.name])),
  ];
}
