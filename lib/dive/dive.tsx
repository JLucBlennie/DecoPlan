export namespace Dive {
  export interface Segment {
    startDepth: number;
    endDepth: number;
    gasName: string;
    time: number;
  }

  export interface Gas {
    fO2: number;
    fHe: number;
    fN2: number;

    modInMeters: (ppO2: number, isFreshWater: boolean) => number;
    endInMeters: (depth: number, isFreshWater: boolean) => number;
    eadInMeters: (depth: number, isFreshWater: boolean) => number;
  }

  export const DiveLib = {
    VERSION: "0.1.1",
    /*
     * The effect of pressure and temperature on the densities of liquids
     * and solids is small. The compressibility for a typical liquid or
     * solid is 10−6 bar−1 (1 bar = 0.1 MPa) and a typical thermal
     * expansivity is 10−5 K−1. This roughly translates into needing
     * around ten thousand times atmospheric pressure to reduce the
     * volume of a substance by one percent. (Although the pressures
     * needed may be around a thousand times smaller for sandy soil
     * and some clays.) A one percent expansion of volume typically
     * requires a temperature increase on the order of thousands of degrees Celsius.
     */
    // current liquid sample density in kilogram per cubic meters (kg/m3) or grams per cubic centimeters (g/cm3)
    liquidSamples: {
      fresh: {
        density: function () {
          return density(1000, 1); // 1000kg / m3 at 0C / 32F (standard conditions for measurements)
        },
      },
      salt: {
        density: function () {
          return density(1030, 1); // 1000kg / m3 at 0C / 32F (standard conditions for measurements)
        },
      },
      mercury: {
        density: function () {
          return density(13595.1, 1); // 13595.1 kg / m3 at 0C / 32F (standard conditions)
        },
      },
    },
    // current gravity sample rates in meters per second per second (m/s2)
    gravitySamples: {
      earth: 9.80665,
      _current: 9.80665,
      current: function (_value: number) {
        return (DiveLib.gravitySamples._current = _value);
      },
    },

    // current surface pressure measured in bar
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
    /// <summary>Calculates standard feet to meters calculation.</summary>
    /// <param name="feet" type="Number">Number of feet to convert.</param>
    /// <returns>The number in meters.</returns>
    if (!feet) return 0.3048;

    return feet * 0.3048;
  }

  export function metersToFeet(meters: number): number {
    /// <summary>Calculates standard meters to feet calculation.</summary>
    /// <param name="meters" type="Number">Number of meters to convert.</param>
    /// <returns>The number in feet.</returns>
    if (!meters) return 3.28084;

    return meters * 3.28084;
  }

  export function mmHgToPascal(mmHg: number): number {
    /// <summary>Returns the definition of mmHg (millimeters mercury) in terms of Pascal.</summary>
    /// <param name="mmHg" type="Number">Millimeters high or depth.</param>
    /// <returns>Typically defined as weight density of mercury</returns>

    if (!mmHg) {
      mmHg = 1;
    }

    return (
      (DiveLib.liquidSamples.mercury.density() / 1000) *
      DiveLib.gravitySamples._current *
      mmHg
    );
  }

  export function pascalToBar(pascals: number): number {
    /// <summary>Calculates the pascal to bar derived unit.</summary>
    /// <param name="pascal" type="Number">The pascal SI derived unit.</param>
    /// <returns>Bar derived unit of pressure from pascal</returns>

    // 100000 pascals = 1 bar
    return pascals / (DiveLib.surfacePressureSamples._current * 100000);
  }

  export function barToPascal(bars: number): number {
    /// <summary>Calculates the bar to pascal derived unit.</summary>
    /// <param name="bars" type="Number">The bar derived unit.</param>
    /// <returns>Pascal derived unit of pressure from bars</returns>

    if (!bars) {
      bars = 1;
    }

    // 100000 pascals = 1 bar
    return bars * (DiveLib.surfacePressureSamples._current * 100000);
  }

  export function atmToBar(atm: number): number {
    /// <summary>Calculates the internal pressure (measure of force per unit area) - often
    /// defined as one newton per square meter.</summary>
    /// <param name="atm" type="Number">The number of atmospheres (atm) to conver.</param>
    /// <returns>Bar dervied unit of pressure from atm.</returns>

    var pascals = atmToPascal(atm);
    return pascalToBar(pascals);
  }

  export function atmToPascal(atm: number): number {
    /// <summary>Calculates the internal pressure (measure of force per unit area) - often
    /// defined as one newton per square meter.</summary>
    /// <param name="atm" type="Number">The number of atmospheres (atm) to conver.</param>
    /// <returns>Pascal SI dervied unit of pressure from atm.</returns>

    // atm is represented as the force per unit area exerted on a surface by the weight of the
    // air above that surface in the atmosphere. The unit of measurement on Earth is typically
    // 101325 pascals = 1 atm.
    // 100000 pascals = 1 bar
    //
    // On Jupiter (since there isn't technically a surface, the base is determined to be at about 10bars) or
    // 10 times the surface pressure on earth. It's funny how easy it is to use bar since you can essentially
    // say how much times the surface pressure on earth is X. Easy conversion.
    //
    // Interesting enough, according to http://en.wikipedia.org/wiki/Bar_(unit)#Definition_and_conversion
    // atm is a deprecated unit of measurement. Despite the fact that bars are not a standard unit of
    // measurement, meterologists and weather reporters worldwide have long measured air pressure in millibars
    // as the values are convenient. After hPa (hectopascals) were setup, meterologists often use hPa which
    // are numerically equivalent to millibars. (i.e. 1hPa = 1mbar = 100Pa).
    //
    // Given the case for Mars, which averages about 600 Pascals = 6hPa = 6mbar
    // That means that the surface pressure on mars is roughly 166 times weaker than
    // the surface pressure on Earth. Given that Mars's gravity is roughly 3.724m/s2.
    // Which means if you had fresh water on Mars (380kg/m3 accounting for density)
    // the weight density of water on mars would be 1415.12 N/m3. Given 600 Pascals = 600 N/m2.
    // You could dive (if fresh water existed on mars to a reasonanly depth), to reach the level
    // of pressure that you would experience typically at 10 meters here on Earth you would have to
    // dive up to 35.191361896 meters or about 115.457 feet.
    //
    // (Please tell me if I'm calculating this wrong, it seems about accurate to me)
    //

    // See also: https://twitter.com/nyxtom/status/296157625123500032
    // Essentially, thoughts that pondered on how Jupiter's gravitational pull would
    // affect the atmospheric pressure underwater for the moons surrounding it (that essentially made of ice and potentially
    // other water based liquid forms). http://www.planetaryexploration.net/jupiter/io/tidal_heating.html

    // atm is essentially a deprecated unit of measurement
    if (!atm) {
      atm = 1;
    }

    // 100000 pascal = 1 bar = 0.986923267 atm
    // 1 atm = 101325 pascal = 1.01325 bar
    return DiveLib.surfacePressureSamples._current * 101325 * atm;
  }

  export function pascalToAtm(pascal: number): number {
    /// <summary>Converts pascal to atm.</summary>
    /// <param type="pascal" type="Number">The pascal unit to convert.</param>
    /// <returns>The atmospheric pressure from pascal SI derived unit.<returns>

    return pascal / (DiveLib.surfacePressureSamples._current * 101325);
  }

  export function density(weight: number, volume: number): number {
    /// <summary>Calculates the liquid density of the mass for the given volume.</summary>
    /// <param name="weight" type="Number">The weight (in kilograms) of the given mass.</param>
    /// <param name="volume" type="Number">The volume of the given mass in (cubic meters m3).</param>
    /// <returns>Density of the mass</returns>

    return weight / volume;
  }

  export function depthInMetersToBars(
    depth: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates the absolute pressure (in bars) for 1 cubic meter of water for the given depth (meters).</summary>
    /// <param name="depth" type="Number">The depth in meters below the surface for 1 cubic meter volume of water.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The absolute pressure (in bars) for the given depth (in meters) of 1 cubic meter volume of water below the surface.</returns>

    var liquidDensity;
    if (isFreshWater) {
      liquidDensity = DiveLib.liquidSamples.fresh.density();
    } else {
      liquidDensity = DiveLib.liquidSamples.salt.density();
    }

    var weightDensity = liquidDensity * DiveLib.gravitySamples._current;
    return (
      pascalToBar(depth * weightDensity) +
      DiveLib.constants.altitudePressure._current
    );
  }

  export function depthInMetersToAtm(
    depth: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates the absolute pressure (in atm) 1 cubic meter of water for the given depth (meters).</summary>
    /// <param name="depth" type="Number">The depth in meters below the surface for 1 cubic meter volume of water.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The absolute pressure (in atm) for the given depth (in meters) of 1 cubic meter volume of water below the surface.</returns>

    var liquidDensity;
    if (isFreshWater) {
      liquidDensity = DiveLib.liquidSamples.fresh.density();
    } else {
      liquidDensity = DiveLib.liquidSamples.salt.density();
    }

    var weightDensity = liquidDensity * DiveLib.gravitySamples._current;
    return (
      pascalToAtm(depth * weightDensity) +
      DiveLib.constants.altitudePressure._current
    );
  }

  export function barToDepthInMeters(
    bars: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates the depth (in meters) for the given atmosphere (bar).</summary>
    /// <param name="bars" type="Number">The number of atmospheric pressure (in bars) to convert.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The depth (in meters) for the given number of atmospheres.</returns>

    var liquidDensity;
    if (isFreshWater) {
      liquidDensity = DiveLib.liquidSamples.fresh.density();
    } else {
      liquidDensity = DiveLib.liquidSamples.salt.density();
    }

    if (!bars) {
      bars = 1; //surface
    }

    bars = bars - DiveLib.constants.altitudePressure._current;

    var weightDensity = liquidDensity * DiveLib.gravitySamples._current;
    var pressure = barToPascal(bars);
    return pressure / weightDensity;
  }

  export function atmToDepthInMeters(
    atm: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates the depth (in meters) for the given atmosphere (atm).</summary>
    /// <param name="atm" type="Number">The number of atmospheres (atm) to convert.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The depth (in meters) for the given number of atmospheres.</returns>

    /*
     * Liquid pressure is defined as: pgh (density of liquid x gravity at the surface x height).
     * or Pressure = weight density x depth
     *
     * Standard Weight Density: (kg/m3) at 32F or 0C
     *  Water (fresh): 1000 kg/m3
     *  Water (salt): 1030 kg/m3
     *
     * since there is always 1atm (above water)
     *
     *  P = depth x weight density + 1P atm
     *
     *  So to calculate the depth under liquid at which pressure is 2x atm,
     *
     *  depth x weight density + atm pressure (P) = 2 atm
     *  depth = 1P atm / weight density
     *
     *  weight density = density x gravity
     *  1 ATM = 101,325 Pa
     *
     *  weight density of water (fresh) at 0C = 1000 kg/m3 x 9.8m/s2
     *
     *  depth = 101325 Pa / (1000 kg/m3 x 9.8m/s2)
     *  1 newton = kg*m/s2
     *  1 pascal = 1 newton / m2
     *
     *
     *  101325 newton per m2 / (9800 kg*m/m3*s2)
     *  9800 kg*m/m3*s2 = 9800 newton per m3
     *
     *  101325 N/m2 / 9800 N/m3 = 10.339285714 meters
     */

    var liquidDensity;
    if (isFreshWater) {
      liquidDensity = DiveLib.liquidSamples.fresh.density();
    } else {
      liquidDensity = DiveLib.liquidSamples.salt.density();
    }

    if (!atm) {
      atm = 1;
    }

    var weightDensity = liquidDensity * DiveLib.gravitySamples._current;
    var pressure = atmToPascal(atm);
    return pressure / weightDensity;
  }

  export function dac(psiIn: number, psiOut: number, runTime: number): number {
    /// <summary>Calculates depth air consumption rate in psi/min.</summary>
    /// <param name="psiIn" type="Number">Pounds/square inch that one starts their dive with.</param>
    /// <param name="psiOut" type="Number">Pounds/square inch that one ends their dive with.</param>
    /// <param name="runTime" type="Number">The total time (in minutes) of a given dive.</param>
    /// <returns>The depth air consumption (DAC) rate in psi/min for the given psi in/out and dive time in minutes.</returns>

    return (psiIn - psiOut) / runTime;
  }

  export function sac(
    dac: number,
    avgDepth: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates surface air consumption rate in psi/min based on DAC (depth air consumption) rate.</summary>
    /// <param name="dac" type="Number">Depth air consumption rate in psi/min.</param>
    /// <param name="avgDepth" type="Number">Average depth (in meters) for length of dive.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate for fresh water rates, false or undefined for salt water.</param>
    /// <returns>The surface air consumption (SAC) rate in psi/min for the given DAC and average depth.</returns>

    var depthToOneATM = atmToDepthInMeters(1, isFreshWater);
    return dac / (avgDepth / depthToOneATM + 1);
  }

  export function rmv(
    sac: number,
    tankVolume: number,
    workingTankPsi: number
  ): number {
    /// <summary>Calculates the respiratory minute volume rate in ft^3/min based on SAC (surface air consumption) rate.</summary>
    /// <param name="sac" type="Number">Surface air consumption rate in psi/min.</param>
    /// <param name="tankVolume" type="Number">Tank volume in cubic feet (typically 80ft^3 or 100ft^3).</param>
    /// <param name="workingTankPsi" type="Number">The working pressure in psi for the given tank (typically stamped on the tank neck).</param>
    /// <returns>The respiratory minute volume rate (RMV) in cubic feet / minute.</returns>

    var tankConversionFactor = tankVolume / workingTankPsi;
    return sac * tankConversionFactor;
  }

  export function partialPressure(
    absPressure: number,
    volumeFraction: number
  ): number {
    /// <summary>Calculates the partial pressure of a gas component from the volume gas fraction and total pressure.</summary>
    /// <param name="absPressure" type="Number">The total pressure P in bars (typically 1 bar of atmospheric pressure + x bars of water pressure).</param>
    /// <param name="volumeFraction" type="Number">The volume fraction of gas component (typically 0.79 for 79%) measured as percentage in decimal.</param>
    /// <returns>The partial pressure of gas component in bar absolute.</returns>

    return absPressure * volumeFraction;
  }

  export function partialPressureAtDepth(
    depth: number,
    volumeFraction: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates the partial pressure of a gas component from the volume gas fraction and total pressure from depth in meters.</summary>
    /// <param name="depth" type="Number">The depth in meters below sea level.</param>
    /// <param name="volumeFraction" type="Number">The volume fraction of gas component (typically 0.79 for 79%) measured as percentage in decimal.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate against the weight density of fresh water versus salt.</param>
    /// <returns>The partial pressure of gas component in bar absolute.</returns>

    var p = depthInMetersToBars(depth, isFreshWater);
    return p * volumeFraction;
  }

  export function waterVapourPressure(degreesCelcius: number): number {
    /// <summary>The vapour pressure of water may be approximated as a function of temperature.</summary>
    /// <param name="temp" type="Number">The temperature to approximate the pressure of water vapour.</param>
    /// <returns>Water vapour pressure in terms of mmHg.</returns>

    /* Based on the Antoine_equation http://en.wikipedia.org/wiki/Antoine_equation */
    /* http://en.wikipedia.org/wiki/Vapour_pressure_of_water */
    var rangeConstants;
    if (degreesCelcius >= 1 && degreesCelcius <= 100)
      rangeConstants = DiveLib.constants.vapourPressure.water.tempRange_1_100;
    else if (degreesCelcius >= 99 && degreesCelcius <= 374)
      rangeConstants = DiveLib.constants.vapourPressure.water.tempRange_99_374;
    else return NaN;

    var logp =
      rangeConstants[0] -
      rangeConstants[1] / (rangeConstants[2] + degreesCelcius);
    return Math.pow(10, logp);
  }

  export function waterVapourPressureInBars(degreesCelcius: number): number {
    /// <summary>The vapour pressure of water may be approximated as a function of temperature.</summary>
    /// <param name="temp" type="Number">The temperature to approximate the pressure of water vapour.</param>
    /// <returns>Water vapour pressure in terms of bars.</returns>

    var mmHg = waterVapourPressure(degreesCelcius);
    var pascals = mmHgToPascal(mmHg);
    return pascalToBar(pascals);
  }

  export function depthChangeInBarsPerMinute(
    beginDepth: number,
    endDepth: number,
    time: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates the depth change speed in bars per minute.</summary>
    /// <param name="beginDepth" type="Number">The begin depth in meters.</param>
    /// <param name="endDepth" type="Number">The end depth in meters.</param>
    /// <param name="time" type="Number">The time that lapsed during the depth change in minutes.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate changes in depth while in fresh water, false for salt water.</param>
    /// <returns>The depth change in bars per minute.</returns>

    var speed = (endDepth - beginDepth) / time;
    return (
      depthInMetersToBars(speed, isFreshWater) -
      DiveLib.constants.altitudePressure._current
    );
  }

  export function gasRateInBarsPerMinute(
    beginDepth: number,
    endDepth: number,
    time: number,
    fGas: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates the gas loading rate for the given depth change in terms of bars inert gas.</summary>
    /// <param name="beginDepth" type="Number">The starting depth in meters.</param>
    /// <param name="endDepth" type="Number">The end depth in meters.</param>
    /// <param name="time" type="Number">The time in minutes that lapsed between the begin and end depths.</param>
    /// <param name="fGas" type="Number">The fraction of gas to calculate for.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate changes in depth while in fresh water, false for salt water.</param>
    /// <returns>The gas loading rate in bars times the fraction of inert gas.</param>

    return (
      depthChangeInBarsPerMinute(beginDepth, endDepth, time, isFreshWater) *
      fGas
    );
  }

  export function gasPressureBreathingInBars(
    depth: number,
    fGas: number,
    isFreshWater: boolean
  ): number {
    /// <summary>Calculates the approximate pressure of the fraction of gas for each breath taken.</summary>
    /// <param name="depth" type="Number">The depth in meters.</param>
    /// <param name="fGas" type="Number">The fraction of the gas taken in.</param>
    /// <param name="isFreshWater" type="Boolean">True to calculate changes while in fresh water, false for salt water.</param>
    /// <returns>The gas pressure in bars taken in with each breath (accounting for water vapour pressure in the lungs).</returns>

    var bars = depthInMetersToBars(depth, isFreshWater);
    //bars = bars - $self.constants.altitudePressure.current() - $self.constants.vapourPressure.lungsBreathing.current();
    //console.log("Depth:"+ depth + ", bars:" + bars + " fGas:" + fGas + ", ppGas:" + (bars*fGas));
    return bars * fGas;
  }

  export function instantaneousEquation(
    pBegin: number,
    pGas: number,
    time: number,
    halfTime: number
  ): number {
    /// <summary>Calculates the compartment inert gas pressure.</summary>
    /// <param name="pBegin" type="Number">Initial compartment inert gas pressure.</param>
    /// <param name="pGas" type="Number">Partial pressure of inspired inert gas.</param>
    /// <param name="time" type="Number">Time of exposure or interval.</param>
    /// <param name="halfTime" type="Number">Half time of the given gas exposure.</param>
    /// <returns>Approximate pressure of a given gas over the exposure rate and half time.</returns>

    //return schreiner equation with rate of change zero - indicating constant depth
    //var instantLoad = (pBegin + (pGas - pBegin) * (1 - Math.pow(2, (-time/halfTime))));
    //if (instantLoad < slopeLoad) {
    //    console.log("InstandLoad: " + instantLoad + ", SlopeLoad:" + slopeLoad);
    //}
    return schreinerEquation(pBegin, pGas, time, halfTime, 0);
  }

  export function schreinerEquation(
    pBegin: number,
    pGas: number,
    time: number,
    halfTime: number,
    gasRate: number
  ): number {
    /// <summary>Calculates the end compartment inert gas pressure in bar.</summary>
    /// <param name="gasRate" type="Number">Rate of descent/ascent in bar times the fraction of inert gas.</param>
    /// <param name="time" type="Number">Time of exposure or interval in minutes.</param>
    /// <param name="timeConstant" type="Number">Log2/half-time in minute.</param>
    /// <param name="pGas" type="Number">Partial pressure of inert gas at CURRENT depth (not target depth - but starting depth where change begins.)</param>
    /// <param name="pBegin" type="Number">Initial compartment inert gas pressure.</param>
    /// <returns>The end compartment inert gas pressure in bar.</returns>
    var timeConstant = Math.log(2) / halfTime;
    return (
      pGas +
      gasRate * (time - 1.0 / timeConstant) -
      (pGas - pBegin - gasRate / timeConstant) * Math.exp(-timeConstant * time)
    );
  }

  export function gas(fO2: number, fHe: number): Gas {
    const gas: Gas = {
      fO2,
      fHe,
      fN2: 1 - (fO2 + fHe),

      modInMeters(ppO2: number, isFreshWater: boolean) {
        return barToDepthInMeters(ppO2 / this.fO2, isFreshWater);
      },

      endInMeters(depth: number, isFreshWater: boolean) {
        // Helium has a narc factor of 0 while N2 and O2 have a narc factor of 1
        var narcIndex = this.fO2 + this.fN2;

        var bars = depthInMetersToBars(depth, isFreshWater);
        var equivalentBars = bars * narcIndex;
        //console.log("Depth: " + depth + " Bars:" + bars + "Relation: " + narcIndex + " Equivalent Bars:" +equivalentBars);
        return barToDepthInMeters(equivalentBars, isFreshWater);
      },

      eadInMeters(depth: number, isFreshWater: boolean) {
        // Helium has a narc factor of 0 while N2 and O2 have a narc factor of 1
        var narcIndex = this.fO2 + this.fN2;

        var bars = depthInMetersToBars(depth, isFreshWater);
        var equivalentBars = bars / narcIndex;
        //console.log("Depth: " + depth + " Bars:" + bars + "Relation: " + narcIndex + " Equivalent Bars:" +equivalentBars);
        return barToDepthInMeters(equivalentBars, isFreshWater);
      },
    };

    return gas;
  }

  export function segment(
    startDepth: number,
    endDepth: number,
    gasName: string,
    time: number
  ): Segment {
    const segment: Segment = {
      gasName,
      startDepth,
      endDepth,
      time,
    };

    return segment;
  }

  //In a single pass, collapses adjacent flat segments together.
  export function collapseSegments(segments:Segment[]):Segment[] {
    var collapsed = true;
    while (collapsed) {
      collapsed = false;
      for (var i = 0; i < segments.length - 1; i++) {
        var segment1 = segments[i];
        var segment2 = segments[i + 1];
        //if both are flat and match the same depth
        if (
          segment1.startDepth == segment1.endDepth &&
          segment2.startDepth == segment2.endDepth &&
          segment1.endDepth == segment2.startDepth &&
          segment1.gasName == segment2.gasName
        ) {
          segment1.time = segment1.time + segment2.time;
          segments.splice(i + 1, 1); //remove segment i+1
          collapsed = true;
          break; //the indexes are all messed up now.
        }
      }
    }

    return segments;
  };
}
