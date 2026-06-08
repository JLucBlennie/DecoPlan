/**
 * DecoPlan – Gaz de plongée
 *
 * Deux exports principaux :
 *
 *  1. `Gas` (classe)  — objet portant ses propres méthodes de calcul.
 *     ⚠️  Après JSON.parse() (AsyncStorage), appeler Gas.fromJSON() pour
 *         restaurer les méthodes sur l'objet plain récupéré.
 *
 *  2. `GasData` (interface) — forme JSON pure, utilisée pour le typage
 *     des données brutes avant réhydratation.
 */

import uuid from 'react-native-uuid';
import { barToDepthInMeters, depthInMetersToBars } from './physics';
import type { GasData } from './types';

// ─── Classe Gas ───────────────────────────────────────────────────────────────

export class Gas implements GasData {
  readonly id: string;
  readonly name: string;
  readonly fO2: number;
  readonly fHe: number;
  readonly fN2: number;

  constructor(id: string, name: string, fO2: number, fHe: number) {
    this.id = id;
    this.name = name;
    this.fO2 = fO2;
    this.fHe = fHe;
    this.fN2 = 1 - (fO2 + fHe);
  }

  // ── Factories ──────────────────────────────────────────────────────────────

  /** Crée un nouveau gaz avec un id généré automatiquement. */
  static create(name: string, fO2: number, fHe: number): Gas {
    return new Gas(uuid.v4() as string, name, fO2, fHe);
  }

  /**
   * Réhydrate un objet plain (issu de JSON.parse / AsyncStorage)
   * en instance de Gas avec ses méthodes.
   *
   * @example
   * const raw = JSON.parse(await AsyncStorage.getItem('gazList'));
   * const gazList = raw.map(Gas.fromJSON);
   */
  static fromJSON(data: GasData): Gas {
    return new Gas(data.id, data.name, data.fO2, data.fHe);
  }

  // ── Sérialisation ──────────────────────────────────────────────────────────

  /** Retourne un objet plain sérialisable (appelé automatiquement par JSON.stringify). */
  toJSON(): GasData {
    return {
      id: this.id,
      name: this.name,
      fO2: this.fO2,
      fHe: this.fHe,
      fN2: this.fN2,
    };
  }

  // ── Calculs ────────────────────────────────────────────────────────────────

  /** Pourcentage O₂ entier (ex : 0.21 → 21). */
  get o2Percent(): number {
    return Math.round(this.fO2 * 100);
  }

  /** Pourcentage He entier (ex : 0.35 → 35). */
  get hePercent(): number {
    return Math.round(this.fHe * 100);
  }

  /**
   * Profondeur maximale d'opération (MOD) en mètres.
   * @param ppO2Max  PpO₂ limite (bar) — typiquement 1.4 fond, 1.6 déco
   * @param isFreshWater  eau douce ou salée
   */
  modInMeters(ppO2Max: number, isFreshWater: boolean): number {
    return barToDepthInMeters(ppO2Max / this.fO2, isFreshWater);
  }

  /**
  * Profondeur narcotique équivalente (END) en mètres.
  * Répond à : "à quelle profondeur sur air ressentirait-on la même narcose ?"
  *
  * Formule : Pamb × (fO2 + fN2) / narcIndex_air
  * narcIndex_air = 0.21 + 0.79 = 1.0 → simplification implicite.
  * L'He n'est pas narcotique → exclu du calcul.
  */
  endInMeters(depth: number, isFreshWater: boolean): number {
    const narcIndex = this.fO2 + this.fN2; // He exclu intentionnellement
    return barToDepthInMeters(
      depthInMetersToBars(depth, isFreshWater) * narcIndex,
      isFreshWater,
    );
  }

  /**
   * Profondeur air équivalente (EAD) en mètres.
   * Répond à : "quelle profondeur sur air aurait la même charge déco ?"
   * Pertinent pour les plongées Nitrox/Trimix : tables air utilisables
   * jusqu'à la MOD du gaz enrichi.
   *
   * Formule : Pamb × fN2 / 0.79
   * Seul N₂ est pris en compte (charge tissulaire), normalisé par N₂ de l'air.
   */
  eadInMeters(depth: number, isFreshWater: boolean): number {
    const AIR_N2_FRACTION = 0.79;
    return barToDepthInMeters(
      depthInMetersToBars(depth, isFreshWater) * this.fN2 / AIR_N2_FRACTION,
      isFreshWater,
    );
  }
  
  /** Pression partielle d'O₂ à une profondeur donnée. */
  ppO2AtDepth(depth: number, isFreshWater: boolean): number {
    return depthInMetersToBars(depth, isFreshWater) * this.fO2;
  }

  // ── Classification ─────────────────────────────────────────────────────────

  get isAir(): boolean { return this.o2Percent === 21 && this.hePercent === 0; }
  get isNitrox(): boolean { return this.o2Percent > 21 && this.hePercent === 0; }
  get isTrimix(): boolean { return this.hePercent > 0; }
  get isHyperoxic(): boolean { return this.o2Percent > 21; }

  /** Label court pour l'affichage (ex: "EAN50", "TX21/35", "AIR"). */
  get shortLabel(): string {
    if (this.isAir) return 'AIR';
    if (this.isTrimix) return `TX${this.o2Percent}/${this.hePercent}`;
    return `EAN${this.o2Percent}`;
  }
}
