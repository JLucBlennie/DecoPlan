import uuid from 'react-native-uuid';

export namespace Dive {
  export interface Plongee {
    id: string;
    name: string;
    segments: Dive.Segment[];
    gazFond: Dive.Gas[];
    gazDeco: Dive.Gas[];
  }

  export interface Segment {
    startDepth: number;
    endDepth: number;
    gasName: string;
    time: number;
  }

  export interface Gas {
    id: string;
    name: string;
    fO2: number;
    fHe: number;
    fN2: number;
  }

  export const DiveLib = {
    VERSION: "0.1.2",
    liquidSamples: {
      fresh: {
        density: function () {
          return density(1000, 1);
        },
      },
      salt: {
        density: function () {
          return density(1030, 1);
        },
      },
      mercury: {
        density: function () {
          return density(13595.1, 1);
        },
      },
    },
    gravitySamples: {
      earth: 9.80665,
      _current: 9.80665,
      current: function (_value: number) {
        return (DiveLib.gravitySamples._current = _value);
      },
    },
    surfacePressureSamples: {
      earth: 1,
      _current: 1,
      current: function (_value: number) {
        return (DiveLib.surfacePressureSamples._current = _value);
      },
    },
    constants: {
      vapourPressure: {
        water: {
          tempRange_1_100: [8.07131, 1730.63, 233.426],
          tempRange_99_374: [8.14019, 1810.94, 244, 485],
        },
        lungsBreathing: {
          _current: 0,
          current: function () {
            if (!DiveLib.constants.vapourPressure.lungsBreathing._current) {
              var value = waterVapourPressureInBars(35.2);
              DiveLib.constants.vapourPressure.lungsBreathing._current = value;
            }
            return DiveLib.constants.vapourPressure.lungsBreathing._current;
          },
        },
      },
      altitudePressure: {
        sealevel: 1,
        _current: 1,
        current: function (_value: number) {
          return (DiveLib.constants.altitudePressure._current = _value);
        },
      },
    },
  };

  export function feetToMeters(feet: number): number {
    if (!feet) return 0.3048;
    return feet * 0.3048;
  }

  export function metersToFeet(meters: number): number {
    if (!meters) return 3.28084;
    return meters * 3.28084;
  }

  export function mmHgToPascal(mmHg: number): number {
    if (!mmHg) { mmHg = 1; }
    return (
      (DiveLib.liquidSamples.mercury.density() / 1000) *
      DiveLib.gravitySamples._current *
      mmHg
    );
  }

  export function pascalToBar(pascals: number): number {
    return pascals / (DiveLib.surfacePressureSamples._current * 100000);
  }

  export function barToPascal(bars: number): number {
    if (!bars) { bars = 1; }
    return bars * (DiveLib.surfacePressureSamples._current * 100000);
  }

  export function atmToBar(atm: number): number {
    var pascals = atmToPascal(atm);
    return pascalToBar(pascals);
  }

  export function atmToPascal(atm: number): number {
    if (!atm) { atm = 1; }
    return DiveLib.surfacePressureSamples._current * 101325 * atm;
  }

  export function pascalToAtm(pascal: number): number {
    return pascal / (DiveLib.surfacePressureSamples._current * 101325);
  }

  export function density(weight: number, volume: number): number {
    return weight / volume;
  }

  export function depthInMetersToBars(depth: number, isFreshWater: boolean): number {
    var liquidDensity = isFreshWater
      ? DiveLib.liquidSamples.fresh.density()
      : DiveLib.liquidSamples.salt.density();
    var weightDensity = liquidDensity * DiveLib.gravitySamples._current;
    return pascalToBar(depth * weightDensity) + DiveLib.constants.altitudePressure._current;
  }

  export function depthInMetersToAtm(depth: number, isFreshWater: boolean): number {
    var liquidDensity = isFreshWater
      ? DiveLib.liquidSamples.fresh.density()
      : DiveLib.liquidSamples.salt.density();
    var weightDensity = liquidDensity * DiveLib.gravitySamples._current;
    return pascalToAtm(depth * weightDensity) + DiveLib.constants.altitudePressure._current;
  }

  export function barToDepthInMeters(bars: number, isFreshWater: boolean): number {
    var liquidDensity = isFreshWater
      ? DiveLib.liquidSamples.fresh.density()
      : DiveLib.liquidSamples.salt.density();
    if (!bars) { bars = 1; }
    bars = bars - DiveLib.constants.altitudePressure._current;
    var weightDensity = liquidDensity * DiveLib.gravitySamples._current;
    return barToPascal(bars) / weightDensity;
  }

  export function atmToDepthInMeters(atm: number, isFreshWater: boolean): number {
    var liquidDensity = isFreshWater
      ? DiveLib.liquidSamples.fresh.density()
      : DiveLib.liquidSamples.salt.density();
    if (!atm) { atm = 1; }
    var weightDensity = liquidDensity * DiveLib.gravitySamples._current;
    return atmToPascal(atm) / weightDensity;
  }

  export function dac(psiIn: number, psiOut: number, runTime: number): number {
    return (psiIn - psiOut) / runTime;
  }

  export function sac(dac: number, avgDepth: number, isFreshWater: boolean): number {
    var depthToOneATM = atmToDepthInMeters(1, isFreshWater);
    return dac / (avgDepth / depthToOneATM + 1);
  }

  export function rmv(sac: number, tankVolume: number, workingTankPsi: number): number {
    return sac * (tankVolume / workingTankPsi);
  }

  export function partialPressure(absPressure: number, volumeFraction: number): number {
    return absPressure * volumeFraction;
  }

  export function partialPressureAtDepth(depth: number, volumeFraction: number, isFreshWater: boolean): number {
    return depthInMetersToBars(depth, isFreshWater) * volumeFraction;
  }

  export function waterVapourPressure(degreesCelcius: number): number {
    var rangeConstants;
    if (degreesCelcius >= 1 && degreesCelcius <= 100)
      rangeConstants = DiveLib.constants.vapourPressure.water.tempRange_1_100;
    else if (degreesCelcius >= 99 && degreesCelcius <= 374)
      rangeConstants = DiveLib.constants.vapourPressure.water.tempRange_99_374;
    else return NaN;
    var logp = rangeConstants[0] - rangeConstants[1] / (rangeConstants[2] + degreesCelcius);
    return Math.pow(10, logp);
  }

  export function waterVapourPressureInBars(degreesCelcius: number): number {
    return pascalToBar(mmHgToPascal(waterVapourPressure(degreesCelcius)));
  }

  export function depthChangeInBarsPerMinute(beginDepth: number, endDepth: number, time: number, isFreshWater: boolean): number {
    var speed = (endDepth - beginDepth) / time;
    return depthInMetersToBars(speed, isFreshWater) - DiveLib.constants.altitudePressure._current;
  }

  export function gasRateInBarsPerMinute(beginDepth: number, endDepth: number, time: number, fGas: number, isFreshWater: boolean): number {
    return depthChangeInBarsPerMinute(beginDepth, endDepth, time, isFreshWater) * fGas;
  }

  /**
   * BUG 1 CORRIGÉ — Pression alvéolaire de gaz inspiré.
   *
   * Formule Bühlmann correcte : Pi_gaz = (Pamb − PH2O) × Fi
   *
   * L'ancienne version calculait simplement Pamb × Fi, omettant la
   * pression de vapeur d'eau pulmonaire (PH2O ≈ 0.0627 bar à 35.2°C).
   * Cela surestimait la charge en gaz inerte dans tous les tissus,
   * produisant des paliers trop courts (algorithme trop optimiste).
   */
  export function gasPressureBreathingInBars(depth: number, fGas: number, isFreshWater: boolean): number {
    var bars = depthInMetersToBars(depth, isFreshWater);
    var PH2O = waterVapourPressureInBars(35.2); // ≈ 0.0627 bar à température corporelle
    return (bars - PH2O) * fGas;
  }

  export function instantaneousEquation(pBegin: number, pGas: number, time: number, halfTime: number): number {
    return schreinerEquation(pBegin, pGas, time, halfTime, 0);
  }

  export function schreinerEquation(pBegin: number, pGas: number, time: number, halfTime: number, gasRate: number): number {
    var timeConstant = Math.log(2) / halfTime;
    return (
      pGas +
      gasRate * (time - 1.0 / timeConstant) -
      (pGas - pBegin - gasRate / timeConstant) * Math.exp(-timeConstant * time)
    );
  }

  export function gas(name: string, fO2: number, fHe: number): Gas {
    return { id: uuid.v4(), name, fO2, fHe, fN2: 1 - (fO2 + fHe) };
  }

  export function modInMeters(ppO2: number, fO2: number, isFreshWater: boolean) {
    return barToDepthInMeters(ppO2 / fO2, isFreshWater);
  }

  export function endInMeters(depth: number, fO2: number, fN2: number, isFreshWater: boolean) {
    var narcIndex = fO2 + fN2;
    return barToDepthInMeters(depthInMetersToBars(depth, isFreshWater) * narcIndex, isFreshWater);
  }

  export function eadInMeters(depth: number, fO2: number, fN2: number, isFreshWater: boolean) {
    var narcIndex = fO2 + fN2;
    return barToDepthInMeters(depthInMetersToBars(depth, isFreshWater) / narcIndex, isFreshWater);
  }

  export function segment(startDepth: number, endDepth: number, gasName: string, time: number): Segment {
    return { gasName, startDepth, endDepth, time };
  }

  export function collapseSegments(segments: Segment[]): Segment[] {
    var collapsed = true;
    while (collapsed) {
      collapsed = false;
      for (var i = 0; i < segments.length - 1; i++) {
        var s1 = segments[i];
        var s2 = segments[i + 1];
        if (
          s1.startDepth === s1.endDepth &&
          s2.startDepth === s2.endDepth &&
          s1.endDepth === s2.startDepth &&
          s1.gasName === s2.gasName
        ) {
          s1.time = s1.time + s2.time;
          segments.splice(i + 1, 1);
          collapsed = true;
          break;
        }
      }
    }
    return segments;
  }

  export const depthToPressFactor: number = 10.1972;

  export function getSegmentOTU(startDepth: number, endDepth: number, fO2First: number, fO2Second: number, ascentRate: number, descenRate: number, segmentTime: number): number {
    var rate: number;
    var otu: number = 0;
    if ((ascentRate > -1) || (descenRate < 1) || (startDepth < 0) || (endDepth < 0) ||
      (segmentTime < 0) || (fO2First > 1) || (fO2First < 0) || (fO2Second > 1) || (fO2Second < 0))
      return -1;
    if (startDepth > endDepth) rate = ascentRate;
    else if (startDepth < endDepth) rate = descenRate;
    else rate = 1;
    var firstSegmentTime: number = (endDepth - startDepth) / rate;
    if (firstSegmentTime > 0) {
      var startPres = startDepth / depthToPressFactor + 1;
      var endPres = endDepth / depthToPressFactor + 1;
      var maxPres = Math.max(startPres, endPres);
      var minPres = Math.min(startPres, endPres);
      var maxPO2 = maxPres * fO2First;
      var minPO2 = minPres * fO2First;
      if (maxPO2 > 0.5) {
        var lowPO2 = Math.max(0.5, minPO2);
        var o2Time = firstSegmentTime * (maxPO2 - lowPO2) / (maxPO2 - minPO2);
        otu = 3.0 / 11.0 * o2Time / (maxPO2 - lowPO2) *
          Math.pow((maxPO2 - 0.5) / 0.5, (11.0 / 6.0)) - Math.pow((lowPO2 - 0.5) / 0.5, (11.0 / 6.0));
        if (otu < 0) otu = 0;
      }
    }
    var secondSegmentTime = segmentTime - firstSegmentTime;
    var segmentPres = endDepth / depthToPressFactor + 1;
    var segmentPO2 = segmentPres * fO2Second;
    if ((segmentPO2 > 0.5) && (secondSegmentTime > 0))
      otu += secondSegmentTime * Math.pow(0.5 / (segmentPO2 - 0.5), (-5.0 / 6.0));
    return otu;
  }

  export function getSegmentCNS(startDepth: number, endDepth: number, fO2First: number, fO2Second: number, ascentRate: number, descenRate: number, segmentTime: number): number {
    var rate: number;
    var cns: number = 0;
    var i: number;
    const noSegments = 10;
    const pO2lo = [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.5, 1.6, 1.7, 1.8];
    const pO2hi = [0.6, 0.7, 0.8, 0.9, 1.1, 1.5, 1.6, 1.7, 1.8, 2.00];
    const limSLP = [1800, -1500, -1200, -900, -600, -300, -750, -280, -72, -44];
    const limINT = [1800, 1620, 1410, 1171, 900, 570, 1245, 493, 139.4, 89];
    if ((ascentRate > -1) || (descenRate < 1) || (startDepth < 0) || (endDepth < 0) ||
      (segmentTime < 0) || (fO2First > 1) || (fO2First < 0) || (fO2Second > 1) || (fO2Second < 0))
      return -1;
    if (startDepth > endDepth) rate = ascentRate;
    else if (startDepth < endDepth) rate = descenRate;
    else rate = 1;
    var firstSegmentTime = (endDepth - startDepth) / rate;
    if (firstSegmentTime > 0) {
      var startPres = startDepth / depthToPressFactor + 1;
      var endPres = endDepth / depthToPressFactor + 1;
      var maxPres = Math.max(startPres, endPres);
      var minPres = Math.min(startPres, endPres);
      var maxPO2 = maxPres * fO2First;
      var minPO2 = minPres * fO2First;
      if (maxPO2 > 2.0) return 5 * segmentTime;
      if (maxPO2 > 0.5) {
        var lowPO2 = Math.max(0.5, minPO2);
        var o2Time = firstSegmentTime * (maxPO2 - minPO2) / (maxPO2 - lowPO2);
        var oTime: number[] = [], pO2o: number[] = [], pO2f: number[] = [], segpO2: number[] = [];
        for (i = 0; i < noSegments; i++) {
          if ((maxPO2 > pO2lo[i]) && (lowPO2 <= pO2hi[i])) {
            if (startDepth > endDepth) { pO2o[i] = Math.min(maxPO2, pO2hi[i]); pO2f[i] = Math.max(lowPO2, pO2lo[i]); }
            else { pO2o[i] = Math.max(lowPO2, pO2lo[i]); pO2f[i] = Math.min(maxPO2, pO2hi[i]); }
            segpO2[i] = pO2f[i] - pO2o[i];
            oTime[i] = (maxPO2 != lowPO2) ? firstSegmentTime * Math.abs(segpO2[i]) / (maxPO2 - lowPO2) : 0.0;
          } else { oTime[i] = 0.0; }
        }
        for (i = 0; i < noSegments; i++) {
          if (oTime[i] > 0.0) {
            var tlimi = limSLP[i] * pO2o[i] + limINT[i];
            var mk = limSLP[i] * (segpO2[i] / oTime[i]);
            cns += 1.0 / mk * (Math.log(Math.abs(tlimi + mk * oTime[i])) - Math.log(Math.abs(tlimi)));
          }
        }
      }
    }
    var secondSegmentTime = segmentTime - firstSegmentTime;
    if (secondSegmentTime > 0) {
      var segPres = endDepth / depthToPressFactor + 1;
      var segPO2 = segPres * fO2Second;
      var tlim = 0;
      if (segPO2 > 2.0) return (cns + 5 * secondSegmentTime);
      if (segPO2 > 0.5) {
        for (i = 0; i < noSegments; i++) {
          if ((segPO2 > pO2lo[i]) && (segPO2 <= pO2hi[i])) { tlim = limSLP[i] * segPO2 + limINT[i]; break; }
        }
        if (tlim > 0) cns += secondSegmentTime / tlim;
        else return -1;
      }
    }
    return cns;
  }

  export function getSegmentGas(startDepth: number, endDepth: number, rmv: number, ascentRate: number, descenRate: number, segmentTime: number, segment: number): number {
    var rate: number;
    var gas: number = 0;
    if ((ascentRate > -1) || (descenRate < 1) || (startDepth < 0) || (endDepth < 0) || (segmentTime < 0))
      return -1;
    if (startDepth > endDepth) rate = ascentRate;
    else if (startDepth < endDepth) rate = descenRate;
    else rate = 1;
    if ((startDepth != endDepth) && (((endDepth - startDepth) / rate) > segmentTime)) return -1;
    var firstSegmentTime = (endDepth - startDepth) / rate;
    if (firstSegmentTime > 0) {
      var startPres = startDepth / depthToPressFactor + 1;
      var endPres = endDepth / depthToPressFactor + 1;
      if ((segment & 1) == 1) gas = (startPres + endPres) / 2 * rmv * firstSegmentTime;
    }
    var secondSegmentTime = segmentTime - firstSegmentTime;
    var segmentPres = endDepth / depthToPressFactor + 1;
    if ((segment & 2) == 2) gas += segmentPres * rmv * secondSegmentTime;
    return gas;
  }

  export function depth2press(depth: number): number {
    return (depth / depthToPressFactor + 1);
  }

  export function plongee(name: string): Plongee {
    return { id: uuid.v4(), name, segments: [], gazFond: [], gazDeco: [] };
  }

  export function calculProfondeurMax(plongee: Plongee): number {
    if (!plongee.segments || plongee.segments.length === 0) return 0;
    return Math.max(...plongee.segments.flatMap(s => [s.startDepth, s.endDepth]));
  }

  export function calculTemps(plongee: Plongee): number {
    if (!plongee.segments) return 0;
    return plongee.segments.reduce((total, s) => total + s.time, 0);
  }

  export function addSegmentToPlongee(plongee: Plongee, segment: Segment) {
    plongee.segments = [...plongee.segments, segment];
  }

  export function addGazFondToPlongee(plongee: Plongee, gazFond: Gas) {
    plongee.gazFond = [...plongee.gazFond, gazFond];
  }

  export function addGazDecoToPlongee(plongee: Plongee, gazDeco: Gas) {
    plongee.gazDeco = [...plongee.gazDeco, gazDeco];
  }
}
