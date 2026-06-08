/**
 * DecoPlan – Physique de la plongée
 *
 * Conversions de pression et de profondeur, pression de vapeur d'eau.
 * Toutes les fonctions sont pures (pas d'état global).
 *
 * Unités utilisées dans ce fichier :
 *   profondeur → mètres
 *   pression   → bar (sauf mention contraire)
 *   température → °C
 */

// ─── Configuration de l'environnement ─────────────────────────────────────────
// Valeurs par défaut modifiables si nécessaire (altitude, eau douce…).
// Préférer passer ces valeurs en paramètre plutôt que de les muter globalement.

export const ENV = {
  gravity:         9.80665,   // m/s²  — standard terrestre
  surfacePressure: 1.0,       // bar   — niveau de la mer
  saltDensity:     1030,      // kg/m³
  freshDensity:    1000,      // kg/m³
  mercuryDensity:  13595.1,   // kg/m³
} as const;

// ─── Conversions d'unités ─────────────────────────────────────────────────────

export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

export function mmHgToPascal(mmHg: number): number {
  return (ENV.mercuryDensity / 1000) * ENV.gravity * mmHg;
}

export function pascalToBar(pascals: number): number {
  return pascals / (ENV.surfacePressure * 100_000);
}

export function barToPascal(bars: number): number {
  return bars * (ENV.surfacePressure * 100_000);
}

export function atmToPascal(atm: number): number {
  return ENV.surfacePressure * 101_325 * atm;
}

export function pascalToAtm(pascal: number): number {
  return pascal / (ENV.surfacePressure * 101_325);
}

export function atmToBar(atm: number): number {
  return pascalToBar(atmToPascal(atm));
}

// ─── Profondeur ↔ Pression ────────────────────────────────────────────────────

function liquidDensity(isFreshWater: boolean): number {
  return isFreshWater ? ENV.freshDensity : ENV.saltDensity;
}

export function depthInMetersToBars(depth: number, isFreshWater: boolean): number {
  const weightDensity = liquidDensity(isFreshWater) * ENV.gravity;
  return pascalToBar(depth * weightDensity) + ENV.surfacePressure;
}

export function barToDepthInMeters(bars: number, isFreshWater: boolean): number {
  const weightDensity = liquidDensity(isFreshWater) * ENV.gravity;
  return barToPascal(bars - ENV.surfacePressure) / weightDensity;
}

export function depthInMetersToAtm(depth: number, isFreshWater: boolean): number {
  const weightDensity = liquidDensity(isFreshWater) * ENV.gravity;
  return pascalToAtm(depth * weightDensity) + ENV.surfacePressure;
}

export function atmToDepthInMeters(atm: number, isFreshWater: boolean): number {
  const weightDensity = liquidDensity(isFreshWater) * ENV.gravity;
  return atmToPascal(atm) / weightDensity;
}

/** Facteur d'approximation rapide profondeur → pression (eau salée, 0m = 1 bar).
 *  Utilisé dans les calculs OTU/CNS hérités. Pour la physique précise,
 *  préférer depthInMetersToBars(). */
export const DEPTH_TO_PRESS_FACTOR = 10.1972;

export function depth2press(depth: number): number {
  return depth / DEPTH_TO_PRESS_FACTOR + 1;
}

// ─── Pression de vapeur d'eau ─────────────────────────────────────────────────

// Constantes Antoine pour l'eau (log10, résultat en mmHg)
const ANTOINE_1_100:   readonly [number, number, number] = [8.07131, 1730.63, 233.426];
const ANTOINE_99_374:  readonly [number, number, number] = [8.14019, 1810.94, 244.485]; // ← virgule → point corrigé

/** Pression de vapeur d'eau en mmHg à une température donnée (°C). */
export function waterVapourPressure(degreesCelsius: number): number {
  let constants: readonly [number, number, number];

  if (degreesCelsius >= 1 && degreesCelsius <= 100) {
    constants = ANTOINE_1_100;
  } else if (degreesCelsius > 100 && degreesCelsius <= 374) {
    constants = ANTOINE_99_374;
  } else {
    return NaN;
  }

  const logp = constants[0] - constants[1] / (constants[2] + degreesCelsius);
  return Math.pow(10, logp);
}

/** Pression de vapeur d'eau en bar à une température donnée (°C). */
export function waterVapourPressureInBars(degreesCelsius: number): number {
  return pascalToBar(mmHgToPascal(waterVapourPressure(degreesCelsius)));
}

/** Pression de vapeur d'eau pulmonaire à température corporelle (≈ 0.0627 bar).
 *  Constante Bühlmann utilisée dans le calcul alvéolaire. */
export const LUNG_VAPOUR_PRESSURE_BAR: number =
  waterVapourPressureInBars(35.2);

// ─── Équations de décompression ───────────────────────────────────────────────

/**
 * Pression alvéolaire d'un gaz inspiré (formule Bühlmann correcte).
 * Pi_gaz = (Pamb − PH₂O) × Fi
 */
export function gasPressureBreathingInBars(
  depth: number,
  fGas: number,
  isFreshWater: boolean,
): number {
  const pAmb = depthInMetersToBars(depth, isFreshWater);
  return (pAmb - LUNG_VAPOUR_PRESSURE_BAR) * fGas;
}

export function partialPressure(absPressure: number, volumeFraction: number): number {
  return absPressure * volumeFraction;
}

export function partialPressureAtDepth(
  depth: number,
  volumeFraction: number,
  isFreshWater: boolean,
): number {
  return depthInMetersToBars(depth, isFreshWater) * volumeFraction;
}

export function depthChangeInBarsPerMinute(
  beginDepth: number,
  endDepth: number,
  time: number,
  isFreshWater: boolean,
): number {
  const speed = (endDepth - beginDepth) / time;
  return depthInMetersToBars(speed, isFreshWater) - ENV.surfacePressure;
}

export function gasRateInBarsPerMinute(
  beginDepth: number,
  endDepth: number,
  time: number,
  fGas: number,
  isFreshWater: boolean,
): number {
  return depthChangeInBarsPerMinute(beginDepth, endDepth, time, isFreshWater) * fGas;
}

// ─── Équations de Schreiner ───────────────────────────────────────────────────

export function instantaneousEquation(
  pBegin: number,
  pGas: number,
  time: number,
  halfTime: number,
): number {
  return schreinerEquation(pBegin, pGas, time, halfTime, 0);
}

export function schreinerEquation(
  pBegin: number,
  pGas: number,
  time: number,
  halfTime: number,
  gasRate: number,
): number {
  const timeConstant = Math.log(2) / halfTime;
  return (
    pGas +
    gasRate * (time - 1.0 / timeConstant) -
    (pGas - pBegin - gasRate / timeConstant) * Math.exp(-timeConstant * time)
  );
}

// ─── Calculs de consommation (SAC / DAC / RMV) ───────────────────────────────

/** Débit d'air consommé (en psi/min). */
export function dac(psiIn: number, psiOut: number, runTime: number): number {
  return (psiIn - psiOut) / runTime;
}

/** Consommation de surface (Surface Air Consumption). */
export function sac(
  dacValue: number,
  avgDepth: number,
  isFreshWater: boolean,
): number {
  const depthToOneATM = atmToDepthInMeters(1, isFreshWater);
  return dacValue / (avgDepth / depthToOneATM + 1);
}

/** Volume respiratoire minute (Respiratory Minute Volume). */
export function rmv(
  sacValue: number,
  tankVolume: number,
  workingTankPsi: number,
): number {
  return sacValue * (tankVolume / workingTankPsi);
}
