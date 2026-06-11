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
  /** Lance le mode pédagogique */
  launch: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePedagogicalLaunch(
  plan: Plan,
  options: UsePedagogicalLaunchOptions,
): UsePedagogicalLaunchReturn {

  const {
    planName       = 'Plongée',
    currentGfLow   = 0.30,
    currentGfHigh  = 0.85,
    variant        = 'ZHL16C',
    onLaunch,
  } = options;

  // ── Visibilité ──────────────────────────────────────────────────────────────
  const [visible, setVisible] = useState(false);

  // ── Configuration initiale des blocs ────────────────────────────────────────
  const initialTanks = useMemo<TankConfig[]>(() => {
    const bottomTanks = Object.values(plan.bottomGasses).map(g => ({
      gasName:          g.name,
      volumeLiters:     12,
      startPressureBar: 200,
    }));
    const decoTanks = Object.values(plan.decoGasses).map(g => ({
      gasName:          g.name,
      volumeLiters:     7,
      startPressureBar: 200,
    }));
    return [...bottomTanks, ...decoTanks];
  }, [plan]);

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
    let planB: DivePlan | undefined;
    if (config.showComparison) {
      planB = buildComparisonPlan(plan, planA, {
        gfLow:    config.gfB.gfLow,
        gfHigh:   config.gfB.gfHigh,
        planName: `GF ${Math.round(config.gfB.gfLow * 100)}/${Math.round(config.gfB.gfHigh * 100)}`,
      });
    }

    close();
    onLaunch(planA, planB);
  }, [plan, config, close, onLaunch]);

  return {
    visible, open, close,
    config, stopSummary,
    handlers: { setGfA, setGfB, toggleComparison, updateTank },
    launch,
  };
}
