import { Dive } from "./dive";

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

      /**
       * BUG 2 CORRIGÉ — Initialisation des tissus : formule incohérente.
       *
       * Ancienne formule : Pamb × 0.79 − PH2O  →  résultat ≠ formule de charge
       * Formule correcte : (Pamb − PH2O) × 0.79
       *
       * La pression alvéolaire initiale de N2 doit être cohérente avec
       * gasPressureBreathingInBars (qui soustrait PH2O avant de multiplier
       * par la fraction de gaz). Sans cette cohérence, les tissus partent
       * d'une pression de référence différente de celle utilisée pendant
       * la plongée, biaisant toute la simulation.
       */
      const PH2O = Dive.waterVapourPressureInBars(35.2); // ≈ 0.0627 bar
      this.pNitrogen = (absPressure - PH2O) * 0.79;
      this.pTotal = this.pNitrogen + this.pHelium;
      this.ceiling = 0;
    }

    N2HalfTime(): number { return this.halfTimes[0]; }
    N2AValue(): number { return this.halfTimes[1]; }
    N2BValue(): number { return this.halfTimes[2]; }
    HeHalfTime(): number { return this.halfTimes[3]; }
    HeAValue(): number { return this.halfTimes[4]; }
    HeBValue(): number { return this.halfTimes[5]; }

    addFlat(depth: number, fO2: number, fHe: number, time: number) {
      this.addDepthChange(depth, depth, fO2, fHe, time);
    }

    addDepthChange(startDepth: number, endDepth: number, fO2: number, fHe: number, time: number): number {
      var fN2 = 1 - fO2 - fHe;

      // Chargement en azote (équation de Schreiner)
      var gasRate = Dive.gasRateInBarsPerMinute(startDepth, endDepth, time, fN2, this.isFreshWater);
      var pGas = Dive.gasPressureBreathingInBars(startDepth, fN2, this.isFreshWater); // Pi = (Pamb - PH2O) × fN2
      var pBegin = this.pNitrogen;
      this.pNitrogen = Dive.schreinerEquation(pBegin, pGas, time, this.N2HalfTime(), gasRate);

      // Chargement en hélium (équation de Schreiner)
      gasRate = Dive.gasRateInBarsPerMinute(startDepth, endDepth, time, fHe, this.isFreshWater);
      pGas = Dive.gasPressureBreathingInBars(startDepth, fHe, this.isFreshWater);
      pBegin = this.pHelium;
      this.pHelium = Dive.schreinerEquation(pBegin, pGas, time, this.HeHalfTime(), gasRate);

      var prevTotal = this.pTotal;
      this.pTotal = this.pNitrogen + this.pHelium;
      return this.pTotal - prevTotal;
    }

    calculateCeiling(gf: number): number {
      gf = gf || 1.0;

      /**
       * BUG 4 CORRIGÉ — Division par zéro si pTotal ≤ 0.
       *
       * Si un tissu n'a aucune charge (pTotal = 0), la division
       * dans le calcul de 'a' et 'b' produit NaN. Ce NaN se propage
       * silencieusement dans getCeiling() via la condition 'if (!ceiling)'
       * (NaN est falsy en JS), causant un ceiling global NaN et des paliers
       * complètement ignorés.
       */
      if (this.pTotal <= 0) {
        this.ceiling = 0;
        return 0;
      }

      // Coefficients a et b combinés N2/He (pondérés par charge partielle)
      var a = (this.N2AValue() * this.pNitrogen + this.HeAValue() * this.pHelium) / this.pTotal;
      var b = (this.N2BValue() * this.pNitrogen + this.HeBValue() * this.pHelium) / this.pTotal;

      // Pression minimale de remontée (équation M-Value avec GF)
      var bars = (this.pTotal - a * gf) / (gf / b + 1.0 - gf);

      // Conversion en mètres (clampée à 0 : négatif = pas de palier obligatoire)
      var depthMeters = Dive.barToDepthInMeters(bars, this.isFreshWater);
      this.ceiling = Math.max(0, depthMeters);
      return Math.ceil(this.ceiling); // Arrondi au mètre supérieur (conservateur)
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
        this.tissues[i] = new BuhlmannTissue(this.buhlmannTable[i], absPressure, isFreshWater);
      }
      this.bottomGasses = {};
      this.decoGasses = {};
      this.segments = [];
    }

    addBottomGas(gaz: Dive.Gas) {
      this.bottomGasses[gaz.name] = gaz;
    }

    addDecoGas(gaz: Dive.Gas) {
      this.decoGasses[gaz.name] = gaz;
    }

    addFlat(depth: number, gasName: string, time: number) {
      return this.addDepthChange(depth, depth, gasName, time);
    }

    addDepthChange(startDepth: number, endDepth: number, gasName: string, time: number): number {
      var gas = this.bottomGasses[gasName] || this.decoGasses[gasName];
      if (gas == undefined) {
        throw "Gasname must only be one of registered gasses. Please use plan.addBottomGas or plan.addDecoGas to register a gas.";
      }
      this.segments.push(Dive.segment(startDepth, endDepth, gasName, time));
      var loadChange = 0.0;
      for (var i = 0; i < this.tissues.length; i++) {
        loadChange += this.tissues[i].addDepthChange(startDepth, endDepth, gas.fO2, gas.fHe, time);
      }
      return loadChange;
    }

    getCeiling(gf: number): number {
      gf = gf || 1.0;

      /**
       * BUG 4 CORRIGÉ — Initialisation et condition de sélection du plafond.
       *
       * Ancienne version : 'if (!ceiling || tissueCeiling > ceiling)'
       *   - '!ceiling' est vrai pour 0 ET pour NaN (falsy en JS)
       *   - Si calculateCeiling() retourne NaN, ceiling prend NaN
       *     et tous les tissus suivants échouent le test 'NaN > x' (false)
       *     → le plafond global reste NaN, les paliers sont ignorés.
       *
       * Correction :
       *   - calculateCeiling() retourne désormais Math.max(0, ...) (≥ 0, jamais NaN)
       *   - On initialise ceiling à 0 et on cherche simplement le maximum
       *     (un tissu sans obligation donne 0, qui ne bat pas le max courant)
       */
      var ceiling = 0;
      for (var i = 0; i < this.tissues.length; i++) {
        var tissueCeiling = this.tissues[i].calculateCeiling(gf);
        if (tissueCeiling > ceiling) {
          ceiling = tissueCeiling;
        }
      }

      // Arrondi au multiple de 3m supérieur (paliers standards)
      while (ceiling % 3 !== 0) {
        ceiling++;
      }
      return ceiling;
    }

    resetTissues(origTissuesJSON: string) {
      var originalTissues = JSON.parse(origTissuesJSON);
      for (var i = 0; i < originalTissues.length; i++) {
        for (var p in originalTissues[i]) {
          (this.tissues[i] as any)[p] = originalTissues[i][p];
        }
      }
    }

    calculateDecompression(
      maintainTissues: boolean,
      gfLow: number,
      gfHigh: number,
      maxppO2: number,
      maxEND: number,
      fromDepth: number | undefined,
      /** Vitesse de remontée entre paliers en m/min (défaut : 9 m/min, norme FFESSM/PADI) */
      ascentRateMpm: number = 9,
      /** Résolution temporelle en minutes (défaut : 1 min ; utilisez 1/6 pour 10s, 0.5 pour 30s) */
      timeStepMin: number = 1
    ): Dive.Segment[] {
      maintainTissues = maintainTissues || false;
      gfLow = gfLow || 1.0;
      gfHigh = gfHigh || 1.0;
      maxppO2 = maxppO2 || 1.6;
      maxEND = maxEND || 30;

      var currentGasName: string | undefined = undefined;

      if (fromDepth === undefined) {
        if (this.segments.length === 0) {
          throw "No depth to decompress from has been specified, and neither have any dive stages been registered.";
        }
        fromDepth = this.segments[this.segments.length - 1].endDepth;
        currentGasName = this.segments[this.segments.length - 1].gasName;
      } else {
        currentGasName = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
        if (currentGasName.length === 0) {
          throw "No deco gas found to decompress from provided depth " + fromDepth;
        }
      }

      var gfDiff = gfHigh - gfLow;

      var origTissues = "";
      if (!maintainTissues) {
        origTissues = JSON.stringify(this.tissues);
      }

      // Mémoriser l'index de début des segments de déco
      // → calculateDecompression ne retourne QUE les nouveaux segments (pas le profil fond)
      var decoSegmentStartIndex = this.segments.length;

      /**
       * BUG 3 CORRIGÉ — Ancrage de la pente GF sur la profondeur du 1er palier.
       *
       * Définition correcte des Gradient Factors (Eric Baker, "Clearing Up The
       * Confusion About 'Deep Stops'") :
       *   - GF Low  s'applique au PREMIER PALIER de déco (le plus profond)
       *   - GF High s'applique à la SURFACE
       *   - La pente est linéaire entre ces deux points
       *
       * L'ancienne version ancrait la pente sur 'fromDepth' (profondeur fond),
       * ce qui donnait un GF trop élevé dès le premier palier :
       *   Ex. fond=40m, 1er palier=21m, GF50/80 :
       *     - Ancien  : GF au 1er palier = 0.50 + (0.30/40) × (40-21) = 0.643 ← FAUX
       *     - Correct : GF au 1er palier = 0.50                               ← OK
       *
       * Conséquence : l'algo était trop permissif dès le premier palier,
       * réduisant la durée de chaque stop → paliers trop courts, plongée unsafe.
       */
      var ceiling = this.getCeiling(gfLow);
      var firstStopDepth = ceiling; // Ancrage de la pente GF ici

      // Pente GF : de gfLow au 1er palier → gfHigh à la surface
      // Si pas de palier (firstStopDepth=0), GF constant = gfHigh partout
      var gfChangePerMeter = firstStopDepth > 0 ? gfDiff / firstStopDepth : 0;

      console.log("1er palier (GF Low=" + gfLow + ") : " + firstStopDepth + "m");
      console.log("Pente GF : " + gfChangePerMeter.toFixed(4) + " GF/m");

      // Remontée du fond vers le 1er palier
      currentGasName = this.addDecoDepthChange(fromDepth, ceiling, maxppO2, maxEND, currentGasName, ascentRateMpm);

      while (ceiling > 0) {
        var currentDepth = ceiling;
        var nextDecoDepth = ceiling - 3;
        var elapsedMin = 0;

        // GF à cette profondeur de palier (interpolation linéaire)
        // gf(depth) = gfHigh - gfChangePerMeter × depth
        // → gf(firstStopDepth) = gfLow, gf(0) = gfHigh
        var gf = gfHigh - gfChangePerMeter * currentDepth;

        // Attente au palier avec résolution timeStepMin
        // (ex. 0.5 min → 30s, améliore la précision vs MultiDeco)
        var maxSteps = Math.ceil(10000 / timeStepMin);
        var steps = 0;
        while (ceiling > nextDecoDepth && steps < maxSteps) {
          this.addFlat(currentDepth, currentGasName, timeStepMin);
          elapsedMin += timeStepMin;
          steps++;
          ceiling = this.getCeiling(gf);
        }

        console.log("Stop " + currentDepth + "m : " + elapsedMin.toFixed(1) + " min (gaz: " + currentGasName + ", GF=" + gf.toFixed(3) + ")");

        // Remontée vers le palier suivant
        currentGasName = this.addDecoDepthChange(currentDepth, ceiling, maxppO2, maxEND, currentGasName, ascentRateMpm);
      }

      if (!maintainTissues) {
        this.resetTissues(origTissues);
      }

      // Ne retourner que les segments de déco (pas le profil fond initial)
      var decoSegments = this.segments.slice(decoSegmentStartIndex);
      return Dive.collapseSegments(decoSegments);
    }

    addDecoDepthChange(
      fromDepth: number,
      toDepth: number,
      maxppO2: number,
      maxEND: number,
      currentGasName: string,
      ascentRateMpm: number = 9
    ): string {
      if (currentGasName.length === 0) {
        currentGasName = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
        if (currentGasName.length === 0) {
          throw "Unable to find starting gas to decompress at depth " + fromDepth;
        }
      }

      while (toDepth < fromDepth) {
        // Si un meilleur gaz est déjà disponible à la profondeur ACTUELLE, switch immédiat
        var betterNow = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
        if (betterNow.length > 0 && betterNow !== currentGasName) {
          console.log("Switch gaz à " + fromDepth + "m : " + currentGasName + " → " + betterNow);
          currentGasName = betterNow;
        }

        /**
         * BUG CORRIGÉ — Remontée avec le bon gaz sur chaque segment.
         *
         * Ancienne version : le code switchait currentGasName AVANT
         * d'appeler addDepthChange, ce qui modélisait l'ascent 40→22m
         * avec EAN50 au lieu de Triox. Schreiner voyait alors une
         * pression initiale N2 de 2.54 bar (EAN50 à 40m) au lieu de
         * 2.24 bar (Triox à 40m), soit +14% de charge N2 fictive.
         *
         * Correction : on détermine d'abord la profondeur de switch,
         * on remonte jusqu'à ce point avec le GAS ACTUEL, PUIS on switch.
         * Cela produit deux segments propres :
         *   40m → 22m avec Triox  (gaz actuel, correct)
         *   22m → 15m avec EAN50  (après switch, correct)
         */
        var switchDepth = toDepth;   // par défaut : remonter tout le chemin
        var nextGasName = currentGasName;

        for (var d = fromDepth - 1; d >= toDepth; d--) {
          var candidate = this.bestDecoGasName(d, maxppO2, maxEND);
          if (candidate.length > 0 && candidate !== currentGasName) {
            switchDepth = d;         // profondeur où le switch a lieu
            nextGasName = candidate;
            break;
          }
        }

        // Remontée de fromDepth → switchDepth avec le GAS ACTUEL
        var depthdiff = fromDepth - switchDepth;
        var time = depthdiff / ascentRateMpm;
        this.addDepthChange(fromDepth, switchDepth, currentGasName, time);
        fromDepth = switchDepth;

        // Switch de gaz au point de switch
        if (nextGasName !== currentGasName) {
          console.log("Switch gaz à " + fromDepth + "m : " + currentGasName + " → " + nextGasName);
          currentGasName = nextGasName;
        }
      }

      return currentGasName;
    }

    bestDecoGasName(depth: number, maxppO2: number, maxEND: number): string {
      var winner: Dive.Gas | undefined = undefined;
      var winnerName = "";
      for (var gasName in this.decoGasses) {
        var candidateGas = this.decoGasses[gasName];
        var mod = Math.round(Dive.modInMeters(maxppO2, candidateGas.fO2, this.isFreshWater));
        var end = Math.round(Dive.endInMeters(depth, candidateGas.fO2, candidateGas.fN2, this.isFreshWater));
        if (depth <= mod && end <= maxEND) {
          if (winner === undefined || winner.fO2 < candidateGas.fO2) {
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
      var origTissues = JSON.stringify(this.tissues);
      var time = 0;
      var change = 1;
      while (ceiling <= 0 && change > 0) {
        change = this.addFlat(depth, gasName, 1);
        ceiling = this.getCeiling(gf);
        time++;
      }
      this.resetTissues(origTissues);
      if (change === 0) {
        return Infinity;
      }
      return time - 1;
    }
  }
}
