// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — usePedagogicalOc
//
// État du réglage « même plongée en circuit ouvert » (départ en CCR) du mode pédagogique :
// gaz de fond et gaz de déco choisis dans la liste des gaz, GF circuit ouvert.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useMemo, useState } from 'react';

import type { GFValues } from '../components/GFSliderPair';
import { bottomGasError, buildOcComparisonPlan } from '../lib/dive/ccr/ocComparisonPlan';
import { Gas } from '../lib/dive/gas';
import { defaultGfFor } from '../lib/dive/gfDefaults';
import type { DivePlan } from '../lib/dive/types';
import type { DiveDefinition } from '../lib/dive/whatIf/types';
import { useGazStore } from '../store/useGazStore';
import { usePreferencesStore } from '../store/usePreferencesStore';

export interface PedagogicalOcState {
  enabled: boolean;
  gf: GFValues;
  bottomGasId: string | undefined;
  /** `undefined` = pas de gaz de déco. */
  decoGasId: string | undefined;
}

export interface UsePedagogicalOcReturn {
  /** Vrai si la plongée de départ est en recycleur : la comparaison circuit ouvert est proposable. */
  available: boolean;
  state: PedagogicalOcState;
  /** Gaz proposés (liste des gaz de l'application + gaz de la plongée). */
  gases: Gas[];
  /** Gaz de fond respirables sur la plongée, parmi `gases`. */
  bottomCandidates: Gas[];
  error: string | null;
  setEnabled: (enabled: boolean) => void;
  setGf: (gf: GFValues) => void;
  setBottomGas: (id: string) => void;
  setDecoGas: (id: string | undefined) => void;
  buildPlan: (reference: DivePlan) => DivePlan | undefined;
}

export function usePedagogicalOc(definition: DiveDefinition | undefined): UsePedagogicalOcReturn {
  const prefs = usePreferencesStore();
  const { gazList } = useGazStore();
  const available = definition?.ccr !== undefined;

  // Liste des gaz : ceux de l'application, plus ceux de la plongée (sans doublon de nom).
  const gases = useMemo(() => {
    const own = definition ? [...definition.bottomGases, ...definition.decoGases] : [];
    const byName = new Map<string, Gas>();
    for (const g of [...own, ...gazList]) if (!byName.has(g.name)) byName.set(g.name, g);
    return [...byName.values()];
  }, [definition, gazList]);

  const bottomCandidates = useMemo(
    () => (definition ? gases.filter(g => bottomGasError(definition, g) === null) : []),
    [definition, gases],
  );

  const gfFor = useCallback((gas: Gas | undefined): GFValues => defaultGfFor(
    { gfLow: prefs.gfLow, gfHigh: prefs.gfHigh, gfLowTrimix: prefs.gfLowTrimix, gfHighTrimix: prefs.gfHighTrimix,
      gfLowCcr: prefs.gfLowCcr, gfHighCcr: prefs.gfHighCcr },
    { ccrDiluentName: undefined, gazFond: gas ? [gas] : [] },
  ), [prefs.gfLow, prefs.gfHigh, prefs.gfLowTrimix, prefs.gfHighTrimix, prefs.gfLowCcr, prefs.gfHighCcr]);

  const [state, setState] = useState<PedagogicalOcState>(() => {
    // Gaz de fond par défaut : le diluant s'il convient, sinon le premier gaz respirable.
    const diluent = definition?.ccr
      ? bottomCandidates.find(g => g.name === definition.ccr?.config.diluentName)
      : undefined;
    const bottom = diluent ?? bottomCandidates[0];
    return {
      enabled: false,
      gf: gfFor(bottom),
      bottomGasId: bottom?.id,
      decoGasId: definition?.decoGases[0]?.id,
    };
  });

  const bottomGas = gases.find(g => g.id === state.bottomGasId);
  const decoGas = gases.find(g => g.id === state.decoGasId);

  const error = useMemo(() => {
    if (!definition || !bottomGas) return 'Choisis un gaz de fond.';
    return bottomGasError(definition, bottomGas);
  }, [definition, bottomGas]);

  const setEnabled = useCallback((enabled: boolean) => setState(s => ({ ...s, enabled })), []);
  const setGf = useCallback((gf: GFValues) => setState(s => ({ ...s, gf })), []);
  const setBottomGas = useCallback((id: string) => {
    setState(s => ({ ...s, bottomGasId: id, gf: gfFor(gases.find(g => g.id === id)) }));
  }, [gases, gfFor]);
  const setDecoGas = useCallback((id: string | undefined) => setState(s => ({ ...s, decoGasId: id })), []);

  const buildPlan = useCallback((reference: DivePlan): DivePlan | undefined => {
    if (!available || !state.enabled || !definition || !bottomGas || error) return undefined;
    return buildOcComparisonPlan(definition, {
      bottomGas,
      decoGas,
      gfLow: state.gf.gfLow,
      gfHigh: state.gf.gfHigh,
      rmvFondLMin: prefs.rmvFond,
      rmvDecoLMin: prefs.rmvDeco,
      reference,
    });
  }, [available, state, definition, bottomGas, decoGas, error, prefs.rmvFond, prefs.rmvDeco]);

  return {
    available, state, gases, bottomCandidates, error,
    setEnabled, setGf, setBottomGas, setDecoGas, buildPlan,
  };
}
