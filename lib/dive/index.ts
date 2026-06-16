/**
 * DecoPlan – Point d'entrée de la librairie de plongée
 *
 * Importer depuis ce fichier pour tout le code applicatif :
 *
 *   import { Gas, createPlongee, depthInMetersToBars } from '../lib/dive';
 *
 * ─── Migration depuis l'ancien dive.tsx ──────────────────────────────────────
 *
 * Les symboles sont regroupés ici pour faciliter la migration progressive.
 * L'ancien namespace `Dive` disparaît ; les correspondances sont :
 *
 *   Dive.Gas                    → Gas (classe)
 *   Dive.Plongee                → Plongee (interface, dans types.ts)
 *   Dive.Segment                → Segment (interface, dans types.ts)
 *   Dive.gas(name, fO2, fHe)    → Gas.create(name, fO2, fHe)
 *   Dive.plongee(name)          → createPlongee(name)
 *   Dive.segment(...)           → createSegment(...)
 *   Dive.modInMeters(...)       → gas.modInMeters(ppO2, isFreshWater)
 *   Dive.endInMeters(...)       → gas.endInMeters(depth, isFreshWater)
 *   Dive.eadInMeters(...)       → gas.eadInMeters(depth, isFreshWater)
 *   Dive.collapseSegments(...)  → collapseSegments(...)
 *   Dive.calculProfondeurMax()  → calculProfondeurMax(plongee)
 *   Dive.calculTemps()          → calculTemps(plongee)
 *   Dive.addSegmentToPlongee()  → addSegment(plongee, segment)
 *   Dive.addGazFondToPlongee()  → addGazFond(plongee, gaz)
 *   Dive.addGazDecoToPlongee()  → addGazDeco(plongee, gaz)
 */

// Types de données (interfaces JSON-safe)
export type { GasData, Plongee, Segment } from './types';

// Classe Gas avec méthodes
export { Gas } from './gas';

// Physique
export {
  atmToDepthInMeters, barToDepthInMeters, dac, depth2press,
  DEPTH_TO_PRESS_FACTOR, depthChangeInBarsPerMinute, depthInMetersToAtm, depthInMetersToBars, ENV,
  feetToMeters, gasPressureBreathingInBars, gasRateInBarsPerMinute, instantaneousEquation, LUNG_VAPOUR_PRESSURE_BAR, metersToFeet, partialPressure,
  partialPressureAtDepth, rmv, sac, schreinerEquation, waterVapourPressure,
  waterVapourPressureInBars
} from './physics';

// Segments
export {
  collapseSegments, createSegment, getSegmentGas, isAscent, isDecoStop, isDescent, maxDepth, totalTime
} from './segment';

// Plongée
export {
  addGazDeco, addGazFond, addSegment, calculProfondeurMax,
  calculTemps, createPlongee, isPlongeeValid, removeGazDeco, removeGazFond, removeSegment
} from './plongee';

// Toxicité oxygène
export { getSegmentCNS, getSegmentOTU } from './toxicity';

// Algorithme Bühlmann ZHL-16
export {
  BuhlmannTissue,
  Plan, ZH16ATissues,
  ZH16BTissues,
  ZH16CTissues
} from './buhlmann';
export type { TissueCoefficient } from './buhlmann';

