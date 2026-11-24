// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — usePedagogicalLaunch
//
// Hook central qui gère :
//   - l'état du formulaire de configuration
//   - la construction des DivePlan via le bridge
//   - le callback de lancement vers la navigation
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useMemo, useState } from 'react';

import type { GFValues } from '../components/GFSliderPair';
import type { Plan } from '../lib/dive/buhlmann';
import type { DecoStopSummary, TankConfig } from '../lib/dive/buildDivePlan';
import type { DecoModel, DivePlan } from '../lib/dive/types';
import type { DiveDefinition } from '../lib/dive/whatIf/types';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { usePedagogicalCcr, type UsePedagogicalCcrReturn } from './usePedagogicalCcr';
import { usePedagogicalOc, type UsePedagogicalOcReturn } from './usePedagogicalOc';

import {
  buildComparisonPlan,
  buildDivePlanFromPlan,
  extractDecoStopSummary
} from '../lib/dive/buildDivePlan';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LaunchConfig {
  planName:       string;
  variant:        DecoModel;
  gfA:            GFValues;
  showComparison: boolean;
  gfB:            GFValues;
  tanks:          TankConfig[];
}

export interface UsePedagogicalLaunchOptions {
  /** Nom affiché dans l'en-tête du mode pédagogique. */
  planName?: string;

  /** GF du calcul courant — pré-remplit le bloc A. */
  currentGfLow?:  number;
  currentGfHigh?: number;

  /** Variante Bühlmann utilisée. */
  variant?: DecoModel;

  /** Définition de la plongée de départ : active la comparaison avec un recycleur. */
  definition?: DiveDefinition;

  /** Blocs de départ (ex. repris de l'optimiseur) ; absent = 12 L/200 b au fond, 7 L/200 b en déco. */
  initialTanks?: TankConfig[];

  /**
   * Appelé quand l'utilisateur tape "Lancer".
   * C'est ici que vous appelez navigation.navigate() ou setModalVisible().
   */
  onLaunch: (planA: DivePlan, planB: DivePlan | undefined) => void;
}

export interface UsePedagogicalLaunchReturn {
  /** Ouvre la config sheet */
  open:  () => void;
  /** Ferme la config sheet */
  close: () => void;
  /** Vrai quand la config sheet est visible */
  visible: boolean;
  /** État complet du formulaire */
  config: LaunchConfig;
  /** Paliers calculés (résumé avant lancement) */
  stopSummary: DecoStopSummary[];
  /** Handlers du formulaire */
  handlers: {
    setGfA:             (v: GFValues) => void;
    setGfB:             (v: GFValues) => void;
    toggleComparison:   () => void;
    updateTank:         (updated: TankConfig) => void;
  };
  /** Réglage « même plongée en recycleur » */
  ccr: UsePedagogicalCcrReturn;
  /** Réglage « même plongée en circuit ouvert » (départ en CCR) */
  oc: UsePedagogicalOcReturn;
  /** Lance le mode pédagogique */
  launch: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/** Blocs par défaut : 12 L/200 b pour chaque gaz de fond, 7 L/200 b pour chaque gaz de déco. */
function defaultTanks(plan: Plan): TankConfig[] {
  const bottom = Object.values(plan.bottomGasses).map(g => ({ gasName: g.name, volumeLiters: 12, startPressureBar: 200 }));
  const deco = Object.values(plan.decoGasses).map(g => ({ gasName: g.name, volumeLiters: 7, startPressureBar: 200 }));
  return [...bottom, ...deco];
}

export function usePedagogicalLaunch(
  plan: Plan,
  options: UsePedagogicalLaunchOptions,
): UsePedagogicalLaunchReturn {

  const {
    planName       = 'Plongée',
    currentGfLow   = 0.30,
    currentGfHigh  = 0.85,
    variant        = 'ZHL16C',
    definition,
    initialTanks: providedTanks,
    onLaunch,
  } = options;

  const ccr = usePedagogicalCcr(definition);
  const oc = usePedagogicalOc(definition);

  // ── Visibilité ──────────────────────────────────────────────────────────────
  const [visible, setVisible] = useState(false);

  // ── Configuration initiale des blocs ────────────────────────────────────────
  const initialTanks = useMemo<TankConfig[]>(() => {
    const defaults = defaultTanks(plan);
    // Un bloc fourni l'emporte sur le bloc par défaut du même gaz ; les autres gaz gardent le défaut.
    return defaults.map(d => providedTanks?.find(t => t.gasName === d.gasName) ?? d);
  }, [plan, providedTanks]);


  // ── État du formulaire ───────────────────────────────────────────────────────
  const [config, setConfig] = useState<LaunchConfig>(() => ({
    planName,
    variant,
    gfA:            { gfLow: currentGfLow,  gfHigh: currentGfHigh },
    showComparison: false,
    gfB:            { gfLow: 0.50,           gfHigh: 1.00 },
    tanks:          initialTanks,
  }));

  // ── Résumé des paliers (lecture seule, pas d'état) ───────────────────────────
  const stopSummary = useMemo(
    () => extractDecoStopSummary(plan),
    [plan],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const setGfA = useCallback((v: GFValues) => {
    setConfig(c => ({ ...c, gfA: v }));
  }, []);

  const setGfB = useCallback((v: GFValues) => {
    setConfig(c => ({ ...c, gfB: v }));
  }, []);

  const toggleComparison = useCallback(() => {
    setConfig(c => ({ ...c, showComparison: !c.showComparison }));
  }, []);

  const updateTank = useCallback((updated: TankConfig) => {
    setConfig(c => ({
      ...c,
      tanks: c.tanks.map(t => t.gasName === updated.gasName ? updated : t),
    }));
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────────
  const open  = useCallback(() => setVisible(true),  []);
  const close = useCallback(() => setVisible(false), []);

  const { ascentRateMMin, ascentRateBetweenStopsMMin } = usePreferencesStore();

  const launch = useCallback(() => {
    // Plan A : on utilise les GF du formulaire (potentiellement différents
    // des GF du calcul courant → recalcule la déco si nécessaire)
    const planA = buildDivePlanFromPlan(plan, {
      variant:   config.variant,
      gfLow:     config.gfA.gfLow,
      gfHigh:    config.gfA.gfHigh,
      planName:  config.planName,
      tanks:     config.tanks,
    });

    // Plan B (comparaison) : même profil, GF différents
    // Plan B : soit la même plongée en recycleur, soit les mêmes niveaux avec d'autres GF.
    let planB: DivePlan | undefined = ccr.buildPlan(planA) ?? oc.buildPlan(planA);
    if (!planB && config.showComparison) {
      planB = buildComparisonPlan(plan, planA, {
        gfLow:    config.gfB.gfLow,
        gfHigh:   config.gfB.gfHigh,
        planName: `GF ${Math.round(config.gfB.gfLow * 100)}/${Math.round(config.gfB.gfHigh * 100)}`,
        ascentRateMMin,
        ascentRateBetweenStopsMMin,
      });
    }

    close();
    onLaunch(planA, planB);
  }, [plan, config, ccr, oc, close, onLaunch, ascentRateMMin, ascentRateBetweenStopsMMin]);

  return {
    visible, open, close,
    config, stopSummary,
    handlers: { setGfA, setGfB, toggleComparison, updateTank },
    ccr, oc, launch,
  };
}
