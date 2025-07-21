import { Dive } from "@/lib/dive/dive";

export namespace Buhlmann {
  export type TissueCoefficient = [
    n2HalfTime: number,
    n2AValue: number,
    n2BValue: number,
    heHalfTime: number,
    heAValue: number,
    heBValue: number
  ];

  export const ZH16ATissues: TissueCoefficient[] = [
    // N2HalfTime, N2AValue, N2BValue, HeHalfTime, HeAValue, HeBValue
    [4.0, 1.2599, 0.505, 1.51, 1.7424, 0.4245],
    [5.0, 1.2599, 0.505, 1.88, 1.6189, 0.477],
    [8.0, 1.0, 0.6514, 3.02, 1.383, 0.5747],
    [12.5, 0.8618, 0.7222, 4.72, 1.1919, 0.6527],
    [18.5, 0.7562, 0.7725, 6.99, 1.0458, 0.7223],
    [27.0, 0.6667, 0.8125, 10.21, 0.922, 0.7582],
    [38.3, 0.5933, 0.8434, 14.48, 0.8205, 0.7957],
    [54.3, 0.5282, 0.8693, 20.53, 0.7305, 0.8279],
    [77.0, 0.4701, 0.891, 29.11, 0.6502, 0.8553],
    [109.0, 0.4187, 0.9092, 41.2, 0.595, 0.8757],
    [146.0, 0.3798, 0.9222, 55.19, 0.5545, 0.8903],
    [187.0, 0.3497, 0.9319, 70.69, 0.5333, 0.8997],
    [239.0, 0.3223, 0.9403, 90.34, 0.5189, 0.9073],
    [305.0, 0.2971, 0.9477, 115.29, 0.5181, 0.9122],
    [390.0, 0.2737, 0.9544, 147.42, 0.5176, 0.9171],
    [498.0, 0.2523, 0.9602, 188.24, 0.5172, 0.9217],
    [635.0, 0.2327, 0.9653, 240.03, 0.5119, 0.9267],
  ];

  export const ZH16BTissues: TissueCoefficient[] = [
    [4.0, 1.2599, 0.505, 1.51, 1.7424, 0.4245],
    [5.0, 1.2599, 0.505, 1.88, 1.6189, 0.477],
    [8.0, 1.0, 0.6514, 3.02, 1.383, 0.5747],
    [12.5, 0.8618, 0.7222, 4.72, 1.1919, 0.6527],
    [18.5, 0.7562, 0.7725, 6.99, 1.0458, 0.7223],
    [27.0, 0.6667, 0.8125, 10.21, 0.922, 0.7582],
    [38.3, 0.56, 0.8434, 14.48, 0.8205, 0.7957],
    [54.3, 0.4947, 0.8693, 20.53, 0.7305, 0.8279],
    [77.0, 0.45, 0.891, 29.11, 0.6502, 0.8553],
    [109.0, 0.4187, 0.9092, 41.2, 0.595, 0.8757],
    [146.0, 0.3798, 0.9222, 55.19, 0.5545, 0.8903],
    [187.0, 0.3497, 0.9319, 70.69, 0.5333, 0.8997],
    [239.0, 0.3223, 0.9403, 90.34, 0.5189, 0.9073],
    [305.0, 0.2971, 0.9477, 115.29, 0.5181, 0.9122],
    [390.0, 0.2737, 0.9544, 147.42, 0.5176, 0.9171],
    [498.0, 0.2523, 0.9602, 188.24, 0.5172, 0.9217],
    [635.0, 0.2327, 0.9653, 240.03, 0.5119, 0.9267],
  ];

  export const ZH16CTissues: TissueCoefficient[] = [
    [4.0, 1.2599, 0.505, 1.51, 1.7424, 0.4245],
    [5.0, 1.2599, 0.505, 1.88, 1.6189, 0.477],
    [8.0, 1.0, 0.6514, 3.02, 1.383, 0.5747],
    [12.5, 0.8618, 0.7222, 4.72, 1.1919, 0.6527],
    [18.5, 0.7562, 0.7725, 6.99, 1.0458, 0.7223],
    [27.0, 0.62, 0.8125, 10.21, 0.922, 0.7582],
    [38.3, 0.5043, 0.8434, 14.48, 0.8205, 0.7957],
    [54.3, 0.441, 0.8693, 20.53, 0.7305, 0.8279],
    [77.0, 0.4, 0.891, 29.11, 0.6502, 0.8553],
    [109.0, 0.375, 0.9092, 41.2, 0.595, 0.8757],
    [146.0, 0.35, 0.9222, 55.19, 0.5545, 0.8903],
    [187.0, 0.3295, 0.9319, 70.69, 0.5333, 0.8997],
    [239.0, 0.3065, 0.9403, 90.34, 0.5189, 0.9073],
    [305.0, 0.2835, 0.9477, 115.29, 0.5181, 0.9122],
    [390.0, 0.261, 0.9544, 147.42, 0.5176, 0.9171],
    [498.0, 0.248, 0.9602, 188.24, 0.5172, 0.9217],
    [635.0, 0.2327, 0.9653, 240.03, 0.5119, 0.9267],
  ];

  export class BuhlmannTissue {
    public pHelium: number;
    public pNitrogen: number;
    public pTotal: number;
    public ceiling: number;

    constructor(
      public halfTimes: TissueCoefficient,
      public absPressure: number = 1,
      public isFreshWater: boolean = false
    ) {
      this.pHelium = 0;
      this.pNitrogen =
        Dive.partialPressure(absPressure, 0.79) -
        Dive.waterVapourPressureInBars(35.2);
      this.pTotal = this.pNitrogen + this.pHelium;
      this.ceiling = 0;
    }

    N2HalfTime(): number {
      return this.halfTimes[0];
    }

    N2AValue(): number {
      return this.halfTimes[1];
    }

    N2BValue(): number {
      return this.halfTimes[2];
    }

    HeHalfTime(): number {
      return this.halfTimes[3];
    }

    HeAValue(): number {
      return this.halfTimes[4];
    }

    HeBValue(): number {
      return this.halfTimes[5];
    }

    addFlat(depth: number, fO2: number, fHe: number, time: number) {
      //This is a helper into depth change - with start/end depths identical
      this.addDepthChange(depth, depth, fO2, fHe, time);
    }

    addDepthChange(
      startDepth: number,
      endDepth: number,
      fO2: number,
      fHe: number,
      time: number
    ): number {
      var fN2 = 1 - fO2 - fHe;
      // Calculate nitrogen loading
      var gasRate = Dive.gasRateInBarsPerMinute(
        startDepth,
        endDepth,
        time,
        fN2,
        this.isFreshWater
      );
      var halfTime = this.N2HalfTime(); // half-time constant = log2/half-time in minutes
      var pGas = Dive.gasPressureBreathingInBars(
        startDepth,
        fN2,
        this.isFreshWater
      ); // initial ambient pressure
      var pBegin = this.pNitrogen; // initial compartment inert gas pressure in bar
      this.pNitrogen = Dive.schreinerEquation(
        pBegin,
        pGas,
        time,
        halfTime,
        gasRate
      );
      //console.log("pBegin=" + pBegin + ", pGas=" + pGas + ", time=" + time +", halfTime=" + halfTime + ", gasRate=" + gasRate + ", result=" + this.pNitrogen);

      // Calculate helium loading
      gasRate = Dive.gasRateInBarsPerMinute(
        startDepth,
        endDepth,
        time,
        fHe,
        this.isFreshWater
      );
      halfTime = this.HeHalfTime();
      pGas = Dive.gasPressureBreathingInBars(
        startDepth,
        fHe,
        this.isFreshWater
      );
      pBegin = this.pHelium;
      this.pHelium = Dive.schreinerEquation(
        pBegin,
        pGas,
        time,
        halfTime,
        gasRate
      );

      var prevTotal = this.pTotal;
      // Calculate total loading
      this.pTotal = this.pNitrogen + this.pHelium;

      //return difference - how much load was added
      return this.pTotal - prevTotal;
    }

    calculateCeiling(gf: number) {
      gf = gf || 1.0;
      var a =
        (this.N2AValue() * this.pNitrogen + this.HeAValue() * this.pHelium) /
        this.pTotal;
      var b =
        (this.N2BValue() * this.pNitrogen + this.HeBValue() * this.pHelium) /
        this.pTotal;
      var bars = (this.pTotal - a * gf) / (gf / b + 1.0 - gf);
      //var bars = (this.pTotal - a) * b;
      this.ceiling = Dive.barToDepthInMeters(bars, this.isFreshWater);
      //console.log("a:" + a + ", b:" + b + ", bars:" + bars + " ceiling:" + this.ceiling);
      return Math.round(this.ceiling);
    }
  }

  export class Plan {
    public tissues: BuhlmannTissue[];
    public bottomGasses: Record<string, Dive.Gas>;
    public decoGasses: Record<string, Dive.Gas>;
    public segments: Dive.Segment[];

    constructor(
      public buhlmannTable: TissueCoefficient[],
      public absPressure: number = 1,
      public isFreshWater: boolean = false
    ) {
      this.tissues = [];
      for (var i = 0; i < this.buhlmannTable.length; i++) {
        this.tissues[i] = new BuhlmannTissue(
          this.buhlmannTable[i],
          absPressure,
          isFreshWater
        );
      }
      this.bottomGasses = {};
      this.decoGasses = {};
      this.segments = [];
    }

    addBottomGas(gasName: string, fO2: number, fHe: number) {
      this.bottomGasses[gasName] = Dive.gas(fO2, fHe);
    }

    addDecoGas(gasName: string, fO2: number, fHe: number) {
      this.decoGasses[gasName] = Dive.gas(fO2, fHe);
    }

    addFlat(depth: number, gasName: string, time: number) {
      console.log("addFlat(" + depth + ", " + gasName + ", " + time + ")");
      return this.addDepthChange(depth, depth, gasName, time);
    }

    addDepthChange(
      startDepth: number,
      endDepth: number,
      gasName: string,
      time: number
    ): number {
      console.log(
        "addDepthChange(" +
          startDepth +
          ", " +
          endDepth +
          ", " +
          gasName +
          ", " +
          time +
          ")"
      );
      console.log("Gaz Fond");
      console.log(this.bottomGasses);
      console.log("Gaz Deco");
      console.log(this.decoGasses);
      var gas = this.bottomGasses[gasName] || this.decoGasses[gasName];
      console.log("Gaz trouvé : " + gasName);
      console.log(gas);
      if (gas == undefined) {
        throw "Gasname must only be one of registered gasses. Please use plan.addBottomGas or plan.addDecoGas to register a gas.";
      }
      var fO2 = gas.fO2;
      var fHe = gas.fHe;

      //store this as a stage
      this.segments.push(Dive.segment(startDepth, endDepth, gasName, time));

      var loadChange = 0.0;
      for (var i = 0; i < this.tissues.length; i++) {
        var tissueChange = this.tissues[i].addDepthChange(
          startDepth,
          endDepth,
          fO2,
          fHe,
          time
        );
        loadChange = loadChange + tissueChange;
      }
      return loadChange;
    }

    getCeiling(gf: number): number {
      gf = gf || 1.0;
      var ceiling = 0;
      for (var i = 0; i < this.tissues.length; i++) {
        var tissueCeiling = this.tissues[i].calculateCeiling(gf);
        if (!ceiling || tissueCeiling > ceiling) {
          ceiling = tissueCeiling;
        }
      }
      while (ceiling % 3 != 0) {
        ceiling++;
      }
      return ceiling;
    }

    resetTissues(origTissuesJSON: string) {
      var originalTissues = JSON.parse(origTissuesJSON);
      for (var i = 0; i < originalTissues.length; i++) {
        for (var p in originalTissues[i]) {
          //TODO : Revoir pour feraire l'affectation correctement.
          this.tissues[i][p] = originalTissues[i][p];
        }
      }
    }

    calculateDecompression(
      maintainTissues: boolean,
      gfLow: number,
      gfHigh: number,
      maxppO2: number,
      maxEND: number,
      fromDepth: number | undefined
    ): Dive.Segment[] {
      maintainTissues = maintainTissues || false;
      gfLow = gfLow || 1.0;
      gfHigh = gfHigh || 1.0;
      maxppO2 = maxppO2 || 1.6;
      maxEND = maxEND || 30;
      var currentGasName: string | undefined = undefined;
      //console.log(this.segments);
      if (fromDepth === undefined) {
        if (this.segments.length == 0) {
          throw "No depth to decompress from has been specified, and neither have any dive stages been registered. Unable to decompress.";
        } else {
          fromDepth = this.segments[this.segments.length - 1].endDepth;
          currentGasName = this.segments[this.segments.length - 1].gasName;
        }
      } else {
        currentGasName = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
        if (currentGasName.length === 0) {
          throw (
            "No deco gas found to decompress from provided depth " + fromDepth
          );
        }
      }

      var gfDiff = gfHigh - gfLow; //find variance in gradient factor
      var distanceToSurface = fromDepth;
      var gfChangePerMeter = gfDiff / distanceToSurface;
      var origTissues = "";
      if (!maintainTissues) {
        origTissues = JSON.stringify(this.tissues);
      }

      var ceiling = this.getCeiling(gfLow);

      currentGasName = this.addDecoDepthChange(
        fromDepth,
        ceiling,
        maxppO2,
        maxEND,
        currentGasName
      );

      console.log("Start Ceiling:" + ceiling + " with GF:" + gfLow);
      while (ceiling > 0) {
        var currentDepth = ceiling;
        var nextDecoDepth = ceiling - 3;
        var time = 0;
        var gf = gfLow + gfChangePerMeter * (distanceToSurface - ceiling);
        console.log(
          "GradientFactor:" + gf + " Next decoDepth:" + nextDecoDepth
        );
        while (ceiling > nextDecoDepth && time <= 10000) {
          this.addFlat(currentDepth, currentGasName, 1);
          time++;
          ceiling = this.getCeiling(gf);
        }

        console.log(
          "Held diver at " +
            currentDepth +
            " for " +
            time +
            " minutes on gas " +
            currentGasName +
            "."
        );
        console.log(
          "Moving diver from current depth " +
            currentDepth +
            " to next ceiling of " +
            ceiling
        );
        currentGasName = this.addDecoDepthChange(
          currentDepth,
          ceiling,
          maxppO2,
          maxEND,
          currentGasName
        );
      }
      if (!maintainTissues) {
        this.resetTissues(origTissues);
      }

      return Dive.collapseSegments(this.segments);
    }

    addDecoDepthChange(
      fromDepth: number,
      toDepth: number,
      maxppO2: number,
      maxEND: number,
      currentGasName: string
    ): string {
      if (currentGasName.length === 0) {
        currentGasName = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
        if (currentGasName.length === 0) {
          throw (
            "Unable to find starting gas to decompress at depth " +
            fromDepth +
            ". No segments provided with bottom mix, and no deco gas operational at this depth."
          );
        }
      }

      // console.log("Starting depth change from " + fromDepth + " moving to " + toDepth + " with starting gas " + currentGasName);
      while (toDepth < fromDepth) {
        //if ceiling is higher, move our diver up.
        //ensure we're on the best gas
        var betterDecoGasName = this.bestDecoGasName(
          fromDepth,
          maxppO2,
          maxEND
        );
        //console.log("addDecoDepthChange ==> " + betterDecoGasName + " for : " + fromDepth + ", " + maxppO2 + ", " + maxEND);
        if (
          betterDecoGasName.length > 0 &&
          betterDecoGasName != currentGasName
        ) {
          console.log(
            "At depth " +
              fromDepth +
              " found a better deco gas " +
              betterDecoGasName +
              ". Switching to better gas."
          );
          currentGasName = betterDecoGasName;
        }

        console.log(
          "Looking for the next best gas moving up between " +
            fromDepth +
            " and " +
            toDepth
        );
        var ceiling = toDepth; //ceiling is toDepth, unless there's a better gas to switch to on the way up.
        for (var nextDepth = fromDepth - 1; nextDepth >= ceiling; nextDepth--) {
          var nextDecoGasName = this.bestDecoGasName(
            nextDepth,
            maxppO2,
            maxEND
          );
          console.log(
            "Testing next gas at depth: " +
              nextDepth +
              " and found: " +
              nextDecoGasName
          );
          if (nextDecoGasName.length > 0 && nextDecoGasName != currentGasName) {
            console.log(
              "Found a gas " +
                nextDecoGasName +
                " to switch to at " +
                nextDepth +
                " which is lower than target ceiling of " +
                ceiling
            );
            ceiling = nextDepth; //Only carry us up to the point where we can use this better gas.
            currentGasName = nextDecoGasName;
            break;
          }
        }

        //take us to the ceiling at 30fpm or 10 mpm (the fastest ascent rate possible.)
        var depthdiff = fromDepth - ceiling;
        var time = depthdiff / 10;
        console.log(
          "Moving diver from " +
            fromDepth +
            " to " +
            ceiling +
            " on gas " +
            currentGasName +
            " over " +
            time +
            " minutes (10 meters or 30 feet per minute)."
        );
        this.addDepthChange(fromDepth, ceiling, currentGasName, time);

        fromDepth = ceiling; //move up from-depth
      }

      var betterDecoGasName = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
      if (betterDecoGasName.length > 0 && betterDecoGasName != currentGasName) {
        console.log(
          "At depth " +
            fromDepth +
            " found a better deco gas " +
            betterDecoGasName +
            ". Switching to better gas."
        );
        currentGasName = betterDecoGasName;
      }

      return currentGasName;
    }

    bestDecoGasName(depth: number, maxppO2: number, maxEND: number): string {
      //console.log("Finding best deco gas for depth " + depth + " with max ppO2 of " + maxppO2 + "  and max END of " + maxEND);
      //best gas is defined as: a ppO2 at depth <= maxppO2,
      // the highest ppO2 among all of these.
      // END <= 30 (equivalent narcotic depth < 30 meters)
      var winner: Dive.Gas | undefined = undefined;
      var winnerName: string = "";
      for (var gasName in this.decoGasses) {
        var candidateGas = this.decoGasses[gasName];
        var mod = Math.round(
          candidateGas.modInMeters(maxppO2, this.isFreshWater)
        );
        var end = Math.round(
          candidateGas.endInMeters(depth, this.isFreshWater)
        );
        console.log(
          "Found candidate deco gas " +
            gasName +
            ": " +
            candidateGas.fO2 +
            "/" +
            candidateGas.fHe +
            " with mod " +
            mod +
            " and END " +
            end
        );
        if (depth <= mod && end <= maxEND) {
          console.log(
            "Candidate " + gasName + " fits within MOD and END limits."
          );
          if (
            winner === undefined || //either we have no winner yet
            winner.fO2 < candidateGas.fO2
          ) {
            //or previous winner is a lower O2
            console.log("Replaced winner: " + candidateGas);
            winner = candidateGas;
            winnerName = gasName;
          }
        }
      }
      return winnerName;
    }

    ndl(depth: number, gasName: string, gf: number) {
      gf = gf || 1.0;

      var ceiling = this.getCeiling(gf);
      //console.log("Ceiling:" +ceiling);

      var origTissues = JSON.stringify(this.tissues);
      var time = 0;
      var change = 1;
      while (ceiling <= 0 && change > 0) {
        //console.log("Ceiling:" +ceiling);
        change = this.addFlat(depth, gasName, 1);
        ceiling = this.getCeiling(gf);
        time++;
      }
      this.resetTissues(origTissues);
      if (change == 0) {
        console.log(
          "NDL is practially infinity. Returning largest number we know of."
        );
        return Infinity;
      }
      return time - 1; //We went one minute past a ceiling of "0"
    }
  }
}
