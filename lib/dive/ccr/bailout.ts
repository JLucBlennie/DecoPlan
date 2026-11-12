/**
 * DecoPlan – CCR : simulation de bail-out en fin de phase fond.
 *
 * Les tissus sont pris à l'instant où la phase fond CCR se termine ; la remontée
 * et la déco sont ensuite calculées en circuit ouvert avec les gaz de déco.
 */

import { Plan } from '../buhlmann';
import { captureTissues, loadTissues } from '../successive/tissueState';
import type { Segment } from '../types';
import type { DiveDefinition } from '../whatIf/types';
import { buildCcrBottomPlan } from './ccrRuntime';
import { computeGasUsage, type GasUsage, type TankConfig } from './bailoutGas';
import type { CcrConfig } from './types';

export interface BailoutOptions {
  /** RMV de bail-out (L/min) — préférence rmvDeco. */
  rmvLMin: number;
  /** Blocs disponibles par nom de gaz (facultatif). */
  tanks?: Record<string, TankConfig>;
  /** Autorise aussi le diluant comme gaz de bail-out (défaut : non, gaz de déco seulement). */
  includeDiluent?: boolean;
}

export interface BailoutResult {
  /** Profondeur du bail-out (fin de fond), en m. */
  depthM: number;
  /** Remontée + déco en circuit ouvert. */
  segments: Segment[];
  totalTimeMin: number;
  gasUsage: GasUsage[];
}

export function computeBailout(
  def: DiveDefinition,
  cfg: CcrConfig,
  options: BailoutOptions,
): BailoutResult {
  const { plan: ccrPlan, bottomSegments } = buildCcrBottomPlan(def, cfg);
  const tissues = captureTissues(ccrPlan);
  const bailoutDepth = bottomSegments[bottomSegments.length - 1].endDepth;

  const oc = new Plan(def.tissueTable, def.absPressureBar, def.isFreshWater);
  loadTissues(oc, tissues);
  def.decoGases.forEach(g => oc.addDecoGas(g));
  if (options.includeDiluent) {
    const dil = [...def.bottomGases, ...def.decoGases].find(g => g.name === cfg.diluentName);
    if (dil) oc.addDecoGas(dil);
  }
  if (Object.keys(oc.decoGasses).length === 0) {
    throw new Error('Bail-out impossible : aucun gaz de déco défini.');
  }
  if (!oc.bestDecoGasName(bailoutDepth, def.maxDecoPpO2, def.maxEndM)) {
    throw new Error(
      `Bail-out impossible à ${bailoutDepth} m : aucun gaz de déco respirable à cette profondeur.`,
    );
  }

  const segments = oc.calculateDecompression(
    false, def.gfLow, def.gfHigh, def.maxDecoPpO2, def.maxEndM,
    bailoutDepth, def.ascentRateMpm, def.timeStepMin, false, def.ascentRateBetweenStopsMpm,
  );

  return {
    depthM: bailoutDepth,
    segments,
    totalTimeMin: segments.reduce((sum, s) => sum + s.time, 0),
    gasUsage: computeGasUsage(segments, options.rmvLMin, def.isFreshWater, options.tanks),
  };
}
