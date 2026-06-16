/**
 * DecoPlan — Bridge entre Plan (buhlmann.ts) et DivePlan (mode pédagogique)
 *
 * Ce fichier est le seul point de contact entre l'algorithme de calcul existant
 * et le mode pédagogique. Il convertit :
 *
 *   Plan  (buhlmann.ts)          →   DivePlan  (pedagogical/types.ts)
 *   ─────────────────────────────────────────────────────────────────
 *   Plan.segments                →   ProfileSegment[]  (temps absolus)
 *   Plan.bottomGasses            →   Gas[]  (role: 'bottom')
 *   Plan.decoGasses              →   Gas[]  (role: 'deco', switchDepthM déduit)
 *   paramètres du calcul         →   model, gfLow, gfHigh
 *   TankConfig[] (UI)            →   Gas.tankVolumeLiters / startPressureBar
 *
 * ⚠️  NOTE SUR LES COMPARTIMENTS
 * L'implémentation buhlmann.ts utilise 17 compartiments (ZHL16A/B/C avec le
 * compartiment "0" à t½N₂=4.0 min). Le hook usePedagogicalSimulation utilise
 * 16 compartiments. Les profils de paliers seront identiques (mêmes segments),
 * seule l'animation des tissus différera légèrement. Pour aligner parfaitement,
 * voir NOTE_CONSTANTS en bas de ce fichier.
 */

// ── Imports ──────────────────────────────────────────────────────────────────
// On importe uniquement les types pour éviter le couplage circulaire.
import type { Plan } from './buhlmann';
import type { Gas } from './gas';

import type {
  DecoModel,
  DivePlan,
  GasConso as PedaGas,
  ProfileSegment,
} from './types';

// ── Types locaux ──────────────────────────────────────────────────────────────

/**
 * Configuration d'un bloc/bouteille.
 * À saisir dans le formulaire de lancement du mode pédagogique.
 * Le `gasName` doit correspondre exactement à Gas.name dans Plan.
 */
export interface TankConfig {
  gasName: string;
  volumeLiters: number;  // volume interne du bloc (ex. 12 pour un 12L)
  startPressureBar: number;  // pression de départ (ex. 200 bar)
}

/**
 * Options de construction du DivePlan pédagogique.
 */
export interface BuildPlanOptions {
  /** Variante de la table Bühlmann utilisée pour le calcul. */
  variant: DecoModel;

  /** GF Low utilisé dans calculateDecompression() — ex. 0.3 */
  gfLow: number;

  /** GF High utilisé dans calculateDecompression() — ex. 0.85 */
  gfHigh: number;

  /** Nom affiché dans l'en-tête du mode pédagogique. */
  planName?: string;

  /**
   * Configuration des blocs. Si un gaz n'est pas listé ici, des valeurs
   * par défaut sont appliquées (12L / 200 bar).
   */
  tanks?: TankConfig[];

  /** Valeur par défaut si tankVolumeLiters non fourni. */
  defaultVolumeLiters?: number;

  /** Valeur par défaut si startPressureBar non fourni. */
  defaultStartPressure?: number;
}

// ── Fonction principale ───────────────────────────────────────────────────────

/**
 * Construit un `DivePlan` pédagogique à partir d'un `Plan` calculé.
 *
 * Usage typique :
 * ```ts
 * const plan = new Plan(ZH16CTissues, 1, false);
 * plan.addBottomGas(air);
 * plan.addDepthChange(0, 30, 'Air', 2);
 * plan.addFlat(30, 'Air', 20);
 * plan.calculateDecompression(false, 0.3, 0.85);
 *
 * const divePlan = buildDivePlanFromPlan(plan, {
 *   variant: 'ZHL16C', gfLow: 0.3, gfHigh: 0.85,
 *   planName: 'Tombant 30m',
 *   tanks: [{ gasName: 'Air', volumeLiters: 12, startPressureBar: 200 }],
 * });
 * ```
 */
export function buildDivePlanFromPlan(
  plan: Plan,
  options: BuildPlanOptions,
): DivePlan {

  const {
    variant,
    gfLow,
    gfHigh,
    planName = 'Plongée',
    tanks = [],
    defaultVolumeLiters = 12,
    defaultStartPressure = 200,
  } = options;

  // ── 1. Convertit les gaz (fond + déco) ─────────────────────────────────────
  const tankMap = new Map(tanks.map(t => [t.gasName, t]));

  const bottomGases = Object.values(plan.bottomGasses).map(gas =>
    convertGas(gas, 'bottom', undefined, tankMap, defaultVolumeLiters, defaultStartPressure)
  );

  // Pour les gaz de déco : on déduit la profondeur de changement depuis les
  // segments réels générés par calculateDecompression().
  const switchDepths = extractSwitchDepths(plan);

  const decoGases = Object.values(plan.decoGasses).map(gas =>
    convertGas(
      gas, 'deco',
      switchDepths.get(gas.name),
      tankMap, defaultVolumeLiters, defaultStartPressure,
    )
  );

  // Ordre stable : gaz de fond d'abord, puis déco du plus profond au plus léger
  const gases: PedaGas[] = [
    ...bottomGases,
    ...decoGases.sort((a, b) => (b.switchDepthM ?? 0) - (a.switchDepthM ?? 0)),
  ];

  // ── 2. Convertit les segments (temps relatifs → temps absolus) ──────────────
  const segments = buildProfileSegments(plan);

  // ── 3. Assemblage ───────────────────────────────────────────────────────────
  return {
    id: `plan_${Date.now()}`,
    name: planName,
    gases,
    segments,
    model: variant,
    gfLow,
    gfHigh,
  };
}

// ── Helpers de conversion ─────────────────────────────────────────────────────

/**
 * Convertit un Gas (buhlmann/gas.ts) en Gas pédagogique.
 */
function convertGas(
  gas: Gas,
  role: 'bottom' | 'deco',
  switchDepthM: number | undefined,
  tankMap: Map<string, TankConfig>,
  defaultVolume: number,
  defaultPressure: number,
): PedaGas {
  const tank = tankMap.get(gas.name);

  return {
    id: gas.name,
    label: labelFromComposition(gas.fO2, gas.fHe),
    fO2: gas.fO2,
    fN2: parseFloat((1 - gas.fO2 - gas.fHe).toFixed(4)),
    fHe: gas.fHe,
    tankVolumeLiters: tank?.volumeLiters ?? defaultVolume,
    startPressureBar: tank?.startPressureBar ?? defaultPressure,
    role,
    switchDepthM,
  };
}

/**
 * Génère un label lisible depuis la composition du gaz.
 * Exemples : "Air", "EAN 50", "O₂ 100%", "TMX 21/35"
 */
export function labelFromComposition(fO2: number, fHe: number): string {
  const pO2 = Math.round(fO2 * 100);
  const pHe = Math.round(fHe * 100);

  if (fHe > 0) return `TMX ${pO2}/${pHe}`;
  if (pO2 >= 99) return 'O₂ 100%';
  if (pO2 > 21) return `EAN ${pO2}`;
  return 'Air';
}

/**
 * Parcourt plan.segments pour trouver la profondeur à laquelle chaque gaz de
 * déco est utilisé pour la première fois en remontée.
 *
 * Logique : on cherche le premier segment dont le gasName correspond à un gaz
 * de déco. Le startDepth de ce segment est la profondeur de changement.
 *
 * Ex. : le calcul génère  [40m→22m: Triox]  [22m→15m: EAN50]  [15m→0m: EAN50]
 *       → EAN50.switchDepthM = 22
 */
function extractSwitchDepths(plan: Plan): Map<string, number> {
  const result = new Map<string, number>();
  const decoNames = new Set(Object.keys(plan.decoGasses));

  for (const seg of plan.segments) {
    if (!decoNames.has(seg.gasName)) continue;
    if (result.has(seg.gasName)) continue; // déjà trouvé

    // On prend startDepth du premier segment utilisant ce gaz
    result.set(seg.gasName, seg.startDepth);
  }

  return result;
}

/**
 * Convertit plan.segments (durées relatives) en ProfileSegment[] (temps absolus).
 *
 * plan.segments ressemble à :
 *   { startDepth: 0, endDepth: 30, gasName: 'Air', time: 2 }
 *   { startDepth: 30, endDepth: 30, gasName: 'Air', time: 20 }
 *   { startDepth: 30, endDepth: 6,  gasName: 'Air', time: 2.67 }
 *   { startDepth: 6,  endDepth: 6,  gasName: 'EAN50', time: 5 }
 *   ...
 *
 * Résultat :
 *   { startTimeMin: 0,  endTimeMin: 2,     startDepth: 0,  endDepth: 30 }
 *   { startTimeMin: 2,  endTimeMin: 22,    startDepth: 30, endDepth: 30 }
 *   { startTimeMin: 22, endTimeMin: 24.67, startDepth: 30, endDepth: 6  }
 *   ...
 */
function buildProfileSegments(plan: Plan): ProfileSegment[] {
  let cursor = 0;

  return plan.segments.map(seg => {
    const start = cursor;
    const end = cursor + seg.time;
    cursor = end;

    return {
      startTimeMin: parseFloat(start.toFixed(4)),
      endTimeMin: parseFloat(end.toFixed(4)),
      startDepthM: seg.startDepth,
      endDepthM: seg.endDepth,
      gasId: seg.gasName,
    };
  });
}

// ── Utilitaire : construction d'un plan "comparaison" ─────────────────────────

/**
 * Construit un second DivePlan avec des GF différents sur le MÊME profil brut
 * (segments de fond seulement), puis recalcule la décompression.
 *
 * C'est le cas d'usage principal du toggle "Comparer" :
 * mêmes profils de fond, GF A vs GF B.
 *
 * Usage :
 * ```ts
 * const planA = buildDivePlanFromPlan(plan, { ..., gfLow: 0.30, gfHigh: 0.85 });
 * const planB = buildComparisonPlan(plan, planA, { gfLow: 0.50, gfHigh: 1.00 });
 * ```
 *
 * ⚠️  Cette fonction ré-exécute calculateDecompression() sur `plan`.
 *     Si maintainTissues était true dans l'appel original, les tissus ont été
 *     modifiés — passer un Plan fraîchement cloné si besoin.
 */
export function buildComparisonPlan(
  plan: Plan,
  reference: DivePlan,
  gfOptions: { gfLow: number; gfHigh: number; planName?: string },
): DivePlan {
  const { gfLow, gfHigh, planName } = gfOptions;

  // Recalcule la déco avec les nouveaux GF (ne modifie pas les tissus)
  plan.calculateDecompression(
    false,   // maintainTissues = false → snapshot/restore automatique
    gfLow,
    gfHigh,
  );

  // Récupère les options de tanks depuis le plan de référence
  const tanks: TankConfig[] = reference.gases.map(g => ({
    gasName: g.id,
    volumeLiters: g.tankVolumeLiters,
    startPressureBar: g.startPressureBar,
  }));

  return buildDivePlanFromPlan(plan, {
    variant: reference.model,
    gfLow,
    gfHigh,
    planName: planName ?? `${reference.name} — GF ${Math.round(gfLow * 100)}/${Math.round(gfHigh * 100)}`,
    tanks,
  });
}

// ── Utilitaire : extraction du résumé des paliers ─────────────────────────────

/**
 * Retourne un résumé lisible des paliers calculés, utile pour l'affichage dans
 * le formulaire de lancement avant d'ouvrir le mode pédagogique.
 *
 * Exemple de sortie :
 *   [{ depthM: 6, durationMin: 5, gasLabel: 'Air' },
 *    { depthM: 3, durationMin: 12, gasLabel: 'EAN 50' }]
 */
export interface DecoStopSummary {
  depthM: number;
  durationMin: number;
  gasLabel: string;
}

export function extractDecoStopSummary(plan: Plan): DecoStopSummary[] {
  return plan.segments
    .filter(seg => seg.startDepth === seg.endDepth && seg.startDepth > 0 && seg.startDepth <= 9)
    .map(seg => ({
      depthM: seg.startDepth,
      durationMin: parseFloat(seg.time.toFixed(1)),
      gasLabel: labelFromComposition(
        (plan.bottomGasses[seg.gasName] ?? plan.decoGasses[seg.gasName])?.fO2 ?? 0.21,
        (plan.bottomGasses[seg.gasName] ?? plan.decoGasses[seg.gasName])?.fHe ?? 0,
      ),
    }));
}