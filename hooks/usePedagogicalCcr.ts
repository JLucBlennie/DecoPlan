// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — usePedagogicalCcr
//
// État du réglage « même plongée en recycleur » du mode pédagogique :
// diluant saisi librement, GF CCR, construction du plan CCR de comparaison.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useMemo, useState } from 'react';

import type { GFValues } from '../components/GFSliderPair';
import { buildCcrComparisonPlan, diluentError } from '../lib/dive/ccr/pedagogicalPlan';
import type { DivePlan } from '../lib/dive/types';
import type { DiveDefinition } from '../lib/dive/whatIf/types';
import { usePreferencesStore } from '../store/usePreferencesStore';

/** Diluant proposé par défaut : trimix 18/45, courant en recycleur profond. */
const DEFAULT_DILUENT_O2_PCT = '18';
const DEFAULT_DILUENT_HE_PCT = '45';

export interface PedagogicalCcrState {
  enabled: boolean;
  gf: GFValues;
  /** Saisies brutes (pourcentages) pour permettre la frappe libre. */
  diluentO2Pct: string;
  diluentHePct: string;
}

export interface UsePedagogicalCcrReturn {
  /** Vrai si la plongée de départ est connue : la comparaison CCR est alors proposable. */
  available: boolean;
  state: PedagogicalCcrState;
  /** Message d'erreur sur la composition du diluant, ou null. */
  error: string | null;
  setEnabled: (enabled: boolean) => void;
  setGf: (gf: GFValues) => void;
  setDiluent: (o2Pct: string, hePct: string) => void;
  /** Construit le plan CCR ; `undefined` si le réglage n'est pas actif. */
  buildPlan: (reference: DivePlan) => DivePlan | undefined;
}

function toFraction(pct: string): number {
  return Number.parseFloat(pct.replace(',', '.')) / 100;
}

export function usePedagogicalCcr(definition: DiveDefinition | undefined): UsePedagogicalCcrReturn {
  const { gfLowCcr, gfHighCcr, ccrSetpointLow, ccrSetpointHigh, ccrSwitchDepthM } = usePreferencesStore();

  const [state, setState] = useState<PedagogicalCcrState>({
    enabled: false,
    gf: { gfLow: gfLowCcr, gfHigh: gfHighCcr },
    diluentO2Pct: DEFAULT_DILUENT_O2_PCT,
    diluentHePct: DEFAULT_DILUENT_HE_PCT,
  });

  const error = useMemo(
    () => diluentError(toFraction(state.diluentO2Pct), toFraction(state.diluentHePct || '0')),
    [state.diluentO2Pct, state.diluentHePct],
  );

  const setEnabled = useCallback((enabled: boolean) => setState(s => ({ ...s, enabled })), []);
  const setGf = useCallback((gf: GFValues) => setState(s => ({ ...s, gf })), []);
  const setDiluent = useCallback(
    (diluentO2Pct: string, diluentHePct: string) => setState(s => ({ ...s, diluentO2Pct, diluentHePct })),
    [],
  );

  const buildPlan = useCallback((reference: DivePlan): DivePlan | undefined => {
    if (!state.enabled || !definition || definition.ccr || error) return undefined;
    return buildCcrComparisonPlan(definition, {
      diluentFO2: toFraction(state.diluentO2Pct),
      diluentFHe: toFraction(state.diluentHePct || '0'),
      gfLow: state.gf.gfLow,
      gfHigh: state.gf.gfHigh,
      setpointLowBar: ccrSetpointLow,
      setpointHighBar: ccrSetpointHigh,
      switchDepthM: ccrSwitchDepthM,
      reference,
    });
  }, [state, definition, error, ccrSetpointLow, ccrSetpointHigh, ccrSwitchDepthM]);

  return { available: definition !== undefined && !definition.ccr, state, error, setEnabled, setGf, setDiluent, buildPlan };
}
