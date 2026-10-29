// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — MN90 : plongées successives, consécutives, indépendantes
//
//   intervalle < 15 min   → CONSECUTIVE : une seule plongée
//                           (profondeur max des deux, temps = somme des temps de plongée)
//   15 min ≤ intervalle < 12 h → SUCCESSIVE : GPS de la plongée 1 → azote résiduel
//                           → majoration ajoutée au temps de la plongée 2
//   intervalle ≥ 12 h     → INDEPENDENT : la plongée 2 se lit seule
// ─────────────────────────────────────────────────────────────────────────────
import {
  getMN90DiveParameters,
  getMN90ProfileFor,
  type MN90DiveParameters,
} from './mn90';
import {
  MN90_CONSECUTIVE_BELOW_MIN,
  MN90_INDEPENDENT_FROM_MIN,
  readMajoration,
  readResidualN2,
} from './mn90SuccessiveLookup';
import type { DivePlan, MN90Profile } from './types';

export type MN90DiveRelation = 'INDEPENDENT' | 'SUCCESSIVE' | 'CONSECUTIVE';

/** Détail des lectures de table, pour l'affichage pédagogique (plongées successives). */
export interface MN90SuccessiveDetail {
  gpsFirst: string;
  /** Colonne d'intervalle lue (min) : intervalle réel arrondi à la valeur inférieure. */
  intervalColumnMin: number;
  residualN2: number;
  /** Ligne de la table de majoration lue, null si pas de résiduel. */
  n2RowBar: number | null;
  /** Colonne de profondeur lue (m) : profondeur réelle arrondie à la valeur supérieure. */
  depthColumnM: number;
  majorationMin: number;
  /** Temps de plongée 2 + majoration : c'est lui qui est cherché dans la table principale. */
  effectiveTimeMin: number;
}

export interface MN90SuccessiveResult {
  relation: MN90DiveRelation;
  /** Plongée 1 lue seule (à titre d'information ; undefined si hors table). */
  firstDive: MN90Profile | undefined;
  /**
   * Profil à suivre pour la 2e plongée : majoré (successive), plongée unique
   * (consécutive) ou lu seul (indépendante). Son gps permet d'enchaîner une 3e plongée.
   */
  secondDive: MN90Profile | undefined;
  /** Plongée unique équivalente (consécutives uniquement). */
  merged?: MN90DiveParameters;
  /** Lectures de table (successives uniquement). */
  detail?: MN90SuccessiveDetail;
  /** Pourquoi secondDive est undefined. */
  unavailableReason?: string;
}

export function getMN90SuccessiveProfile(
  first: MN90DiveParameters,
  second: MN90DiveParameters,
  surfaceIntervalMin: number,
  ascentRateMMin: number,
  ascentRateBetweenStopsMMin: number,
): MN90SuccessiveResult {
  const read = (p: MN90DiveParameters, timeMin = p.diveTimeMin) =>
    getMN90ProfileFor(p.maxDepthM, timeMin, ascentRateMMin, ascentRateBetweenStopsMMin);

  const firstDive = read(first);

  if (surfaceIntervalMin < MN90_CONSECUTIVE_BELOW_MIN) {
    const merged: MN90DiveParameters = {
      maxDepthM: Math.max(first.maxDepthM, second.maxDepthM),
      diveTimeMin: first.diveTimeMin + second.diveTimeMin,
    };
    const secondDive = read(merged);
    return {
      relation: 'CONSECUTIVE',
      firstDive,
      secondDive,
      merged,
      unavailableReason: secondDive ? undefined : 'La plongée unique équivalente est hors table.',
    };
  }

  if (surfaceIntervalMin >= MN90_INDEPENDENT_FROM_MIN) {
    const secondDive = read(second);
    return {
      relation: 'INDEPENDENT',
      firstDive,
      secondDive,
      unavailableReason: secondDive ? undefined : 'La 2e plongée est hors table.',
    };
  }

  const unavailable = (reason: string): MN90SuccessiveResult => ({
    relation: 'SUCCESSIVE',
    firstDive,
    secondDive: undefined,
    unavailableReason: reason,
  });

  const gpsFirst = firstDive?.gps;
  if (!gpsFirst) {
    return unavailable('La 1re plongée est hors table : pas de GPS, plongée successive impossible.');
  }

  const residual = readResidualN2(gpsFirst, surfaceIntervalMin);
  if (!residual) return unavailable(`GPS « ${gpsFirst} » inconnu de la table d'azote résiduel.`);

  const majoration = readMajoration(residual.residualN2, second.maxDepthM);
  if (!majoration) {
    return unavailable(
      'Plongée successive hors table de majoration (profondeur supérieure à 60 m ou azote résiduel trop élevé).',
    );
  }

  const effectiveTimeMin = second.diveTimeMin + majoration.majorationMin;
  const secondDive = read(second, effectiveTimeMin);

  return {
    relation: 'SUCCESSIVE',
    firstDive,
    secondDive,
    detail: {
      gpsFirst,
      intervalColumnMin: residual.intervalColumnMin,
      residualN2: residual.residualN2,
      n2RowBar: majoration.n2RowBar,
      depthColumnM: majoration.depthColumnM,
      majorationMin: majoration.majorationMin,
      effectiveTimeMin,
    },
    unavailableReason: secondDive ? undefined : 'La 2e plongée, une fois majorée, est hors table.',
  };
}

/** Variante qui prend directement les deux plans simulés du mode pédagogique. */
export function getMN90SuccessiveProfileFromPlans(
  firstPlan: DivePlan,
  secondPlan: DivePlan,
  surfaceIntervalMin: number,
  ascentRateMMin: number,
  ascentRateBetweenStopsMMin: number,
): MN90SuccessiveResult {
  return getMN90SuccessiveProfile(
    getMN90DiveParameters(firstPlan),
    getMN90DiveParameters(secondPlan),
    surfaceIntervalMin,
    ascentRateMMin,
    ascentRateBetweenStopsMMin,
  );
}
