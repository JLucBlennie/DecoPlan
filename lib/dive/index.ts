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
export type { Gas as GasData, Segment, Plongee } from './types';

// Classe Gas avec méthodes
export { Gas } from './gas';

// Physique
export {
  ENV,
  feetToMeters,
  metersToFeet,
  depthInMetersToBars,
  barToDepthInMeters,
  depthInMetersToAtm,
  atmToDepthInMeters,
  gasPressureBreathingInBars,
  partialPressure,
  partialPressureAtDepth,
  waterVapourPressure,
  waterVapourPressureInBars,
  LUNG_VAPOUR_PRESSURE_BAR,
  schreinerEquation,
  instantaneousEquation,
  depthChangeInBarsPerMinute,
  gasRateInBarsPerMinute,
  dac,
  sac,
  rmv,
  depth2press,
  DEPTH_TO_PRESS_FACTOR,
} from './physics';

// Segments
export {
  createSegment,
  collapseSegments,
  totalTime,
  maxDepth,
  isDecoStop,
  isAscent,
  isDescent,
  getSegmentGas,
} from './segment';

// Plongée
export {
  createPlongee,
  addSegment,
  removeSegment,
  addGazFond,
  addGazDeco,
  removeGazFond,
  removeGazDeco,
  calculProfondeurMax,
  calculTemps,
  isPlongeeValid,
} from './plongee';

// Toxicité oxygène
export { getSegmentOTU, getSegmentCNS } from './toxicity';

// Algorithme Bühlmann ZHL-16
export {
  ZH16ATissues,
  ZH16BTissues,
  ZH16CTissues,
  BuhlmannTissue,
  Plan,
} from './buhlmann';
export type { TissueCoefficient } from './buhlmann';
