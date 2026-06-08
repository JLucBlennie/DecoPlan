/**
 * DecoPlan – Algorithme de décompression Bühlmann ZHL-16
 *
 * Implémente les variantes A, B et C des tables de coefficients tissulaires,
 * avec support des Gradient Factors (GF Low / GF High) selon la méthode
 * décrite par Eric Baker ("Clearing Up The Confusion About 'Deep Stops'").
 *
 * Bugs corrigés documentés inline (BUG 1→4).
 */

import type { Segment } from './types';
import { Gas }          from './gas';
import {
  LUNG_VAPOUR_PRESSURE_BAR,
  gasRateInBarsPerMinute,
  gasPressureBreathingInBars,
  schreinerEquation,
  barToDepthInMeters,
} from './physics';
import { createSegment, collapseSegments } from './segment';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Coefficients tissulaires Bühlmann : demi-temps et valeurs a/b pour N₂ et He.
 * [n2HalfTime, n2A, n2B, heHalfTime, heA, heB]
 */
export type TissueCoefficient = [
  n2HalfTime: number,
  n2AValue:   number,
  n2BValue:   number,
  heHalfTime: number,
  heAValue:   number,
  heBValue:   number,
];

/** Snapshot des pressions tissulaires — utilisé pour sauvegarder/restaurer l'état. */
type TissueSnapshot = Pick<BuhlmannTissue, 'pNitrogen' | 'pHelium' | 'pTotal' | 'ceiling'>;

// ─── Tables de coefficients ───────────────────────────────────────────────────

export const ZH16ATissues: TissueCoefficient[] = [
  [4.0,   1.2599, 0.505,  1.51,   1.7424, 0.4245],
  [5.0,   1.2599, 0.505,  1.88,   1.6189, 0.477 ],
  [8.0,   1.0,    0.6514, 3.02,   1.383,  0.5747],
  [12.5,  0.8618, 0.7222, 4.72,   1.1919, 0.6527],
  [18.5,  0.7562, 0.7725, 6.99,   1.0458, 0.7223],
  [27.0,  0.6667, 0.8125, 10.21,  0.922,  0.7582],
  [38.3,  0.5933, 0.8434, 14.48,  0.8205, 0.7957],
  [54.3,  0.5282, 0.8693, 20.53,  0.7305, 0.8279],
  [77.0,  0.4701, 0.891,  29.11,  0.6502, 0.8553],
  [109.0, 0.4187, 0.9092, 41.2,   0.595,  0.8757],
  [146.0, 0.3798, 0.9222, 55.19,  0.5545, 0.8903],
  [187.0, 0.3497, 0.9319, 70.69,  0.5333, 0.8997],
  [239.0, 0.3223, 0.9403, 90.34,  0.5189, 0.9073],
  [305.0, 0.2971, 0.9477, 115.29, 0.5181, 0.9122],
  [390.0, 0.2737, 0.9544, 147.42, 0.5176, 0.9171],
  [498.0, 0.2523, 0.9602, 188.24, 0.5172, 0.9217],
  [635.0, 0.2327, 0.9653, 240.03, 0.5119, 0.9267],
];

export const ZH16BTissues: TissueCoefficient[] = [
  [4.0,   1.2599, 0.505,  1.51,   1.7424, 0.4245],
  [5.0,   1.2599, 0.505,  1.88,   1.6189, 0.477 ],
  [8.0,   1.0,    0.6514, 3.02,   1.383,  0.5747],
  [12.5,  0.8618, 0.7222, 4.72,   1.1919, 0.6527],
  [18.5,  0.7562, 0.7725, 6.99,   1.0458, 0.7223],
  [27.0,  0.6667, 0.8125, 10.21,  0.922,  0.7582],
  [38.3,  0.56,   0.8434, 14.48,  0.8205, 0.7957],
  [54.3,  0.4947, 0.8693, 20.53,  0.7305, 0.8279],
  [77.0,  0.45,   0.891,  29.11,  0.6502, 0.8553],
  [109.0, 0.4187, 0.9092, 41.2,   0.595,  0.8757],
  [146.0, 0.3798, 0.9222, 55.19,  0.5545, 0.8903],
  [187.0, 0.3497, 0.9319, 70.69,  0.5333, 0.8997],
  [239.0, 0.3223, 0.9403, 90.34,  0.5189, 0.9073],
  [305.0, 0.2971, 0.9477, 115.29, 0.5181, 0.9122],
  [390.0, 0.2737, 0.9544, 147.42, 0.5176, 0.9171],
  [498.0, 0.2523, 0.9602, 188.24, 0.5172, 0.9217],
  [635.0, 0.2327, 0.9653, 240.03, 0.5119, 0.9267],
];

export const ZH16CTissues: TissueCoefficient[] = [
  [4.0,   1.2599, 0.505,  1.51,   1.7424, 0.4245],
  [5.0,   1.2599, 0.505,  1.88,   1.6189, 0.477 ],
  [8.0,   1.0,    0.6514, 3.02,   1.383,  0.5747],
  [12.5,  0.8618, 0.7222, 4.72,   1.1919, 0.6527],
  [18.5,  0.7562, 0.7725, 6.99,   1.0458, 0.7223],
  [27.0,  0.62,   0.8125, 10.21,  0.922,  0.7582],
  [38.3,  0.5043, 0.8434, 14.48,  0.8205, 0.7957],
  [54.3,  0.441,  0.8693, 20.53,  0.7305, 0.8279],
  [77.0,  0.4,    0.891,  29.11,  0.6502, 0.8553],
  [109.0, 0.375,  0.9092, 41.2,   0.595,  0.8757],
  [146.0, 0.35,   0.9222, 55.19,  0.5545, 0.8903],
  [187.0, 0.3295, 0.9319, 70.69,  0.5333, 0.8997],
  [239.0, 0.3065, 0.9403, 90.34,  0.5189, 0.9073],
  [305.0, 0.2835, 0.9477, 115.29, 0.5181, 0.9122],
  [390.0, 0.261,  0.9544, 147.42, 0.5176, 0.9171],
  [498.0, 0.248,  0.9602, 188.24, 0.5172, 0.9217],
  [635.0, 0.2327, 0.9653, 240.03, 0.5119, 0.9267],
];

// ─── BuhlmannTissue ───────────────────────────────────────────────────────────

export class BuhlmannTissue {
  public pHelium:   number;
  public pNitrogen: number;
  public pTotal:    number;
  public ceiling:   number;

  constructor(
    public readonly halfTimes: TissueCoefficient,
    public readonly absPressure: number   = 1,
    public readonly isFreshWater: boolean = false,
  ) {
    this.pHelium = 0;

    /**
     * BUG 2 CORRIGÉ — Initialisation des tissus : formule incohérente.
     *
     * Ancienne formule : Pamb × 0.79 − PH₂O  → résultat ≠ formule de charge
     * Formule correcte : (Pamb − PH₂O) × 0.79
     *
     * La pression alvéolaire initiale de N₂ doit être cohérente avec
     * gasPressureBreathingInBars. Sans ça, les tissus partent d'une référence
     * différente de celle utilisée pendant la plongée.
     */
    this.pNitrogen = (absPressure - LUNG_VAPOUR_PRESSURE_BAR) * 0.79;
    this.pTotal    = this.pNitrogen;
    this.ceiling   = 0;
  }

  // ── Accesseurs coefficients (getters > méthodes pour des propriétés pures) ──

  get n2HalfTime(): number { return this.halfTimes[0]; }
  get n2AValue():   number { return this.halfTimes[1]; }
  get n2BValue():   number { return this.halfTimes[2]; }
  get heHalfTime(): number { return this.halfTimes[3]; }
  get heAValue():   number { return this.halfTimes[4]; }
  get heBValue():   number { return this.halfTimes[5]; }

  // ── Chargement tissulaire ─────────────────────────────────────────────────

  addFlat(depth: number, fO2: number, fHe: number, time: number): void {
    this.addDepthChange(depth, depth, fO2, fHe, time);
  }

  addDepthChange(
    startDepth: number,
    endDepth:   number,
    fO2:        number,
    fHe:        number,
    time:       number,
  ): number {
    const fN2 = 1 - fO2 - fHe;

    // Chargement en azote (équation de Schreiner)
    const n2Rate  = gasRateInBarsPerMinute(startDepth, endDepth, time, fN2, this.isFreshWater);
    const n2pGas  = gasPressureBreathingInBars(startDepth, fN2, this.isFreshWater);
    this.pNitrogen = schreinerEquation(this.pNitrogen, n2pGas, time, this.n2HalfTime, n2Rate);

    // Chargement en hélium (équation de Schreiner)
    const heRate  = gasRateInBarsPerMinute(startDepth, endDepth, time, fHe, this.isFreshWater);
    const hepGas  = gasPressureBreathingInBars(startDepth, fHe, this.isFreshWater);
    const prevTotal = this.pTotal;
    this.pHelium   = schreinerEquation(this.pHelium, hepGas, time, this.heHalfTime, heRate);

    this.pTotal = this.pNitrogen + this.pHelium;
    return this.pTotal - prevTotal;
  }

  // ── Plafond de décompression ──────────────────────────────────────────────

  calculateCeiling(gf: number): number {
    /**
     * BUG 4 CORRIGÉ — Division par zéro si pTotal ≤ 0.
     *
     * Si un tissu n'a aucune charge (pTotal = 0), la division dans le calcul
     * de 'a' produit NaN, qui se propage silencieusement dans getCeiling()
     * et cause des paliers ignorés.
     */
    if (this.pTotal <= 0) {
      this.ceiling = 0;
      return 0;
    }

    // Coefficients a et b combinés N₂/He, pondérés par charge partielle
    const a = (this.n2AValue * this.pNitrogen + this.heAValue * this.pHelium) / this.pTotal;
    const b = (this.n2BValue * this.pNitrogen + this.heBValue * this.pHelium) / this.pTotal;

    // Pression minimale de remontée (M-value avec GF)
    const bars      = (this.pTotal - a * gf) / (gf / b + 1.0 - gf);
    const depthMeters = barToDepthInMeters(bars, this.isFreshWater);

    // Clampé à 0 : une valeur négative signifie pas de palier obligatoire
    this.ceiling = Math.max(0, depthMeters);
    return Math.ceil(this.ceiling);
  }
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

export class Plan {
  public tissues:      BuhlmannTissue[];
  public bottomGasses: Record<string, Gas>;
  public decoGasses:   Record<string, Gas>;
  public segments:     Segment[];

  constructor(
    public readonly buhlmannTable: TissueCoefficient[],
    public readonly absPressure:   number   = 1,
    public readonly isFreshWater:  boolean  = false,
  ) {
    this.tissues = buhlmannTable.map(
      coeff => new BuhlmannTissue(coeff, absPressure, isFreshWater),
    );
    this.bottomGasses = {};
    this.decoGasses   = {};
    this.segments     = [];
  }

  // ── Enregistrement des gaz ────────────────────────────────────────────────

  addBottomGas(gaz: Gas): void {
    this.bottomGasses[gaz.name] = gaz;
  }

  addDecoGas(gaz: Gas): void {
    this.decoGasses[gaz.name] = gaz;
  }

  // ── Ajout de segments au profil ───────────────────────────────────────────

  addFlat(depth: number, gasName: string, time: number): number {
    return this.addDepthChange(depth, depth, gasName, time);
  }

  addDepthChange(
    startDepth: number,
    endDepth:   number,
    gasName:    string,
    time:       number,
  ): number {
    const gas = this.bottomGasses[gasName] ?? this.decoGasses[gasName];
    if (!gas) {
      throw new Error(
        `Gaz "${gasName}" non enregistré. Utilisez addBottomGas() ou addDecoGas().`,
      );
    }

    this.segments.push(createSegment(startDepth, endDepth, gasName, time));

    let loadChange = 0;
    for (const tissue of this.tissues) {
      loadChange += tissue.addDepthChange(startDepth, endDepth, gas.fO2, gas.fHe, time);
    }
    return loadChange;
  }

  // ── Plafond global ────────────────────────────────────────────────────────

  getCeiling(gf: number): number {
    /**
     * BUG 4 CORRIGÉ — Initialisation et condition de sélection du plafond.
     *
     * Ancienne version : 'if (!ceiling || tissueCeiling > ceiling)'
     *   → '!ceiling' est vrai pour 0 ET pour NaN (falsy en JS)
     *   → si calculateCeiling() retourne NaN, ceiling devient NaN
     *     et tous les tissus suivants échouent 'NaN > x' → paliers ignorés.
     *
     * Correction : calculateCeiling() garantit ≥ 0 (jamais NaN),
     * on cherche simplement le maximum (Math.max, neutre à 0).
     */
    let ceiling = 0;
    for (const tissue of this.tissues) {
      const tissueCeiling = tissue.calculateCeiling(gf);
      if (tissueCeiling > ceiling) ceiling = tissueCeiling;
    }

    // Arrondi au multiple de 3m supérieur (paliers standards)
    while (ceiling % 3 !== 0) ceiling++;
    return ceiling;
  }

  // ── Snapshot tissulaire (sauvegarde / restauration) ───────────────────────

  /** Prend un snapshot des pressions de tous les tissus. */
  private snapshotTissues(): TissueSnapshot[] {
    return this.tissues.map(t => ({
      pNitrogen: t.pNitrogen,
      pHelium:   t.pHelium,
      pTotal:    t.pTotal,
      ceiling:   t.ceiling,
    }));
  }

  /** Restaure les pressions tissulaires depuis un snapshot. */
  private restoreTissues(snapshot: TissueSnapshot[]): void {
    snapshot.forEach((data, i) => {
      this.tissues[i].pNitrogen = data.pNitrogen;
      this.tissues[i].pHelium   = data.pHelium;
      this.tissues[i].pTotal    = data.pTotal;
      this.tissues[i].ceiling   = data.ceiling;
    });
  }

  // ── Calcul de décompression ───────────────────────────────────────────────

  calculateDecompression(
    maintainTissues: boolean  = false,
    gfLow:           number   = 1.0,
    gfHigh:          number   = 1.0,
    maxppO2:         number   = 1.6,
    maxEND:          number   = 30,
    fromDepth?:      number,
    /** Vitesse de remontée entre paliers en m/min (défaut : 9 m/min, norme FFESSM/PADI). */
    ascentRateMpm:   number   = 9,
    /** Résolution temporelle en minutes (défaut : 1 min ; 1/6 ≈ 10 s, 0.5 = 30 s). */
    timeStepMin:     number   = 1,
    /** Active les logs de debug dans la console. */
    debug:           boolean  = false,
  ): Segment[] {
    let currentGasName: string;

    if (fromDepth === undefined) {
      if (this.segments.length === 0) {
        throw new Error(
          'Aucune profondeur de décompression spécifiée et aucun segment enregistré.',
        );
      }
      const lastSegment = this.segments[this.segments.length - 1];
      fromDepth      = lastSegment.endDepth;
      currentGasName = lastSegment.gasName;
    } else {
      currentGasName = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
      if (!currentGasName) {
        throw new Error(`Aucun gaz de déco disponible pour la profondeur ${fromDepth}m.`);
      }
    }

    const snapshot = maintainTissues ? null : this.snapshotTissues();
    const decoSegmentStartIndex = this.segments.length;

    /**
     * BUG 3 CORRIGÉ — Ancrage de la pente GF sur le 1er palier (pas sur le fond).
     *
     * Définition correcte (Eric Baker) :
     *   - GF Low  s'applique au PREMIER PALIER (le plus profond)
     *   - GF High s'applique à la SURFACE
     *   - La pente est linéaire entre ces deux points
     *
     * L'ancienne version ancrait sur 'fromDepth' (fond), donnant un GF trop
     * élevé dès le 1er palier → paliers trop courts → unsafe.
     */
    let ceiling = this.getCeiling(gfLow);
    const firstStopDepth = ceiling;

    // Pente GF/m : 0 si pas de palier (GF constant = gfHigh)
    const gfChangePerMeter = firstStopDepth > 0
      ? (gfHigh - gfLow) / firstStopDepth
      : 0;

    if (debug) {
      console.log(`1er palier (GF Low=${gfLow}) : ${firstStopDepth}m`);
      console.log(`Pente GF : ${gfChangePerMeter.toFixed(4)} GF/m`);
    }

    // Remontée du fond vers le 1er palier
    currentGasName = this.addDecoDepthChange(
      fromDepth, ceiling, maxppO2, maxEND, currentGasName, ascentRateMpm, debug,
    );

    while (ceiling > 0) {
      const currentDepth  = ceiling;
      const nextDecoDepth = ceiling - 3;

      // GF interpolé à cette profondeur : gf(0) = gfHigh, gf(firstStop) = gfLow
      const gf = gfHigh - gfChangePerMeter * currentDepth;

      // Attente au palier par pas de timeStepMin
      let elapsedMin = 0;
      const maxSteps = Math.ceil(10_000 / timeStepMin);
      let steps = 0;

      while (ceiling > nextDecoDepth && steps < maxSteps) {
        this.addFlat(currentDepth, currentGasName, timeStepMin);
        elapsedMin += timeStepMin;
        steps++;
        ceiling = this.getCeiling(gf);
      }

      if (debug) {
        console.log(
          `Stop ${currentDepth}m : ${elapsedMin.toFixed(1)} min` +
          ` (gaz: ${currentGasName}, GF=${gf.toFixed(3)})`,
        );
      }

      // Remontée vers le palier suivant
      currentGasName = this.addDecoDepthChange(
        currentDepth, ceiling, maxppO2, maxEND, currentGasName, ascentRateMpm, debug,
      );
    }

    if (snapshot) this.restoreTissues(snapshot);

    return collapseSegments(this.segments.slice(decoSegmentStartIndex));
  }

  // ── Remontée avec changements de gaz ─────────────────────────────────────

  private addDecoDepthChange(
    fromDepth:      number,
    toDepth:        number,
    maxppO2:        number,
    maxEND:         number,
    currentGasName: string,
    ascentRateMpm:  number = 9,
    debug:          boolean = false,
  ): string {
    if (!currentGasName) {
      currentGasName = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
      if (!currentGasName) {
        throw new Error(`Aucun gaz disponible pour décompresser depuis ${fromDepth}m.`);
      }
    }

    while (toDepth < fromDepth) {
      // Switch immédiat si un meilleur gaz est déjà disponible ici
      const betterNow = this.bestDecoGasName(fromDepth, maxppO2, maxEND);
      if (betterNow && betterNow !== currentGasName) {
        if (debug) console.log(`Switch gaz à ${fromDepth}m : ${currentGasName} → ${betterNow}`);
        currentGasName = betterNow;
      }

      /**
       * BUG CORRIGÉ — Remontée avec le bon gaz sur chaque segment.
       *
       * Ancienne version : switch AVANT addDepthChange → mauvaise pression
       * initiale dans Schreiner (gaz suivant utilisé pour la remontée actuelle).
       *
       * Correction : on détermine la profondeur de switch, on remonte avec
       * le GAS ACTUEL jusqu'à ce point, PUIS on switch. Deux segments propres :
       *   40m → 22m : Triox  (gaz actuel)
       *   22m → 15m : EAN50  (après switch)
       */
      let switchDepth = toDepth;
      let nextGasName = currentGasName;

      for (let d = fromDepth - 1; d >= toDepth; d--) {
        const candidate = this.bestDecoGasName(d, maxppO2, maxEND);
        if (candidate && candidate !== currentGasName) {
          switchDepth = d;
          nextGasName = candidate;
          break;
        }
      }

      const depthDiff = fromDepth - switchDepth;
      const time      = depthDiff / ascentRateMpm;
      this.addDepthChange(fromDepth, switchDepth, currentGasName, time);
      fromDepth = switchDepth;

      if (nextGasName !== currentGasName) {
        if (debug) console.log(`Switch gaz à ${fromDepth}m : ${currentGasName} → ${nextGasName}`);
        currentGasName = nextGasName;
      }
    }

    return currentGasName;
  }

  // ── Sélection du meilleur gaz de déco ────────────────────────────────────

  bestDecoGasName(depth: number, maxppO2: number, maxEND: number): string {
    let winner: Gas | undefined;
    let winnerName = '';

    for (const [gasName, candidateGas] of Object.entries(this.decoGasses)) {
      // Utilisation des méthodes de la classe Gas (plus lisible que les fonctions standalone)
      const mod = Math.round(candidateGas.modInMeters(maxppO2, this.isFreshWater));
      const end = Math.round(candidateGas.endInMeters(depth, this.isFreshWater));

      if (depth <= mod && end <= maxEND) {
        if (!winner || winner.fO2 < candidateGas.fO2) {
          winner     = candidateGas;
          winnerName = gasName;
        }
      }
    }

    return winnerName;
  }

  // ── Limite de non-décompression (NDL) ────────────────────────────────────

  ndl(depth: number, gasName: string, gf: number = 1.0): number {
    const snapshot = this.snapshotTissues();
    let ceiling    = this.getCeiling(gf);
    let time       = 0;
    let change     = 1;

    while (ceiling <= 0 && change > 0) {
      change  = this.addFlat(depth, gasName, 1);
      ceiling = this.getCeiling(gf);
      time++;
    }

    this.restoreTissues(snapshot);
    return change === 0 ? Infinity : time - 1;
  }
}
