import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  computeRuntime, computeWhatIf, definitionFromPlongee,
  Plan, Plongee, Segment, WhatIfResult,
} from '../lib/dive';
import { usePlongeeStore } from '../store/usePlongeeStore';
import { sharedStyles } from '../styles/sharedStyles';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '../navigation/types';
import { usePedagogicalStore } from '../store/usePedagogicalStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { GFSliderPair, GFValues } from './GFSliderPair';
import { PedagogicalLaunchButton } from './PedagogicalLaunchButton';
import PlongeePicker from './PlongeePicker';
import RuntimeResult from './RuntimeResult';
import SegmentedToggle from './SegmentedToggle';
import WhatIfColumns from './WhatIfColumns';

type ResultView = 'detail' | 'whatIf';

const RESULT_VIEWS: { value: ResultView; label: string }[] = [
  { value: 'detail', label: 'Détail' },
  { value: 'whatIf', label: 'Et si ?' },
];

export default function RuntimeScreen() {
  const { setPlans } = usePedagogicalStore();
  const { plongeeList } = usePlongeeStore();

  // ── Paramètres ─────────────────────────────────────────────────────────────
  const [selectedPlongee, setSelectedPlongee] = useState<Plongee | null>(null);
  const {
    gfLow: defaultGfLow, gfHigh: defaultGfHigh,
    descentRateMMin, ascentRateMMin, ascentRateBetweenStopsMMin,
  } = usePreferencesStore();
  const [gfValues, setGfValues] = useState<GFValues>({
    gfLow: defaultGfLow,
    gfHigh: defaultGfHigh,
  });

  // ── Résultats ──────────────────────────────────────────────────────────────
  const [decoPlan, setDecoPlan] = useState<Segment[]>([]);
  const [decoObject, setDecoObject] = useState<Plan | null>(null);  // ← Plan conservé pour le mode péda
  const [whatIf, setWhatIf] = useState<WhatIfResult | null>(null);
  const [whatIfError, setWhatIfError] = useState<string | null>(null);
  const [resultView, setResultView] = useState<ResultView>('detail');
  const [showResult, setShowResult] = useState(false);

  // ── Calcul ─────────────────────────────────────────────────────────────────
  /**
   * Le runtime nominal et les scénarios « Et si ? » partent de la même
   * définition de plongée (lib/dive/whatIf). Le Plan du nominal est conservé :
   * il est nécessaire à buildDivePlanFromPlan() dans le mode pédagogique.
   */
  function handleSubmit() {
    if (!selectedPlongee) return;
    setShowResult(false);

    // Chaque niveau de plongee.segments est un "palier" : profondeur cible + temps
    // total à ce niveau, TRANSITION COMPRISE (convention MN90). La transition est
    // insérée automatiquement (vitesses des préférences) — voir expandPlongeeSegments.
    // Vitesse de remontée fond→1er palier (défaut FFESSM 10 m/min), puis plus lente
    // entre paliers (défaut 6 m/min) : réglables dans usePreferencesStore.
    const definition = definitionFromPlongee(selectedPlongee, {
      gfLow: gfValues.gfLow,
      gfHigh: gfValues.gfHigh,
      descentRateMMin,
      ascentRateMMin,
      ascentRateBetweenStopsMMin,
    });

    const { plan, decoSegments } = computeRuntime(definition);
    setDecoPlan([...selectedPlongee.segments, ...decoSegments]);
    setDecoObject(plan);          // ← Plan stocké pour le mode pédagogique

    // Un échec des scénarios ne doit pas masquer le runtime nominal.
    try {
      setWhatIf(computeWhatIf(definition));
      setWhatIfError(null);
    } catch (error) {
      setWhatIf(null);
      setWhatIfError(error instanceof Error ? error.message : String(error));
    }

    setShowResult(true);
  }

  const handlePlongeeSelect = (plongeeId: string | null) => {
    const found = plongeeList.find(p => p.id === plongeeId);
    setSelectedPlongee(found ?? null);
    setShowResult(false);
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={sharedStyles.screenContainer} edges={['top']}>
    <View style={sharedStyles.screenContainer}>

      <Text style={sharedStyles.screenTitle}>Calcul décompression</Text>

      {/* Sélection de la plongée */}
      <Text style={[sharedStyles.sectionLabel, { marginTop: spacing.sm }]}>Plongée</Text>
      <View style={styles.pickerWrapper}>
        <PlongeePicker
          plongees={plongeeList}
          selectedId={selectedPlongee?.id ?? null}
          onSelect={handlePlongeeSelect}
        />
      </View>

      {/* GF avec sliders */}
      <Text style={[sharedStyles.sectionLabel, { marginTop: spacing.md }]}>Gradient Factors</Text>
      <View style={styles.gfCard}>
        <GFSliderPair
          values={gfValues}
          onChange={setGfValues}
          accentColor={ocean.accent.blue}
        />
      </View>

      {/* Bouton de calcul */}
      <TouchableOpacity
        style={[styles.calcBtn, !selectedPlongee && styles.calcBtnDisabled]}
        onPress={handleSubmit}
        disabled={!selectedPlongee}
        activeOpacity={0.8}
      >
        <MaterialIcons name="calculate" size={20} color={ocean.bg.deep} />
        <Text style={styles.calcBtnTxt}>Calculer</Text>
      </TouchableOpacity>

      {/* Résultat + bouton pédagogique */}
      {showResult && decoPlan.length > 0 && (
        <View style={styles.resultArea}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Résultat</Text>
            {/* Bouton mode pédagogique — visible uniquement après calcul */}
            {decoObject && selectedPlongee && (
              <PedagogicalLaunchButton
                plan={decoObject}
                planName={selectedPlongee.name}
                currentGfLow={gfValues.gfLow}
                currentGfHigh={gfValues.gfHigh}
                variant="button"
                onLaunch={(planA, planB) => {
                  setPlans(planA, planB);
                  router.push(ROUTES.PEDAGOGICAL);
                }}
              />
            )}
          </View>

          {/* Détail du nominal ou scénarios « Et si ? » à côté du nominal */}
          <SegmentedToggle value={resultView} options={RESULT_VIEWS} onChange={setResultView} />

          {resultView === 'detail' && <RuntimeResult data={decoPlan} />}
          {resultView === 'whatIf' && whatIf && <WhatIfColumns result={whatIf} />}
          {resultView === 'whatIf' && !whatIf && (
            <Text style={styles.whatIfError}>
              Scénarios indisponibles{whatIfError ? ` : ${whatIfError}` : '.'}
            </Text>
          )}
        </View>
      )}

      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pickerWrapper: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: ocean.border.subtle,
    borderRadius: radius.md,
    backgroundColor: ocean.bg.surface,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  gfCard: {
    alignSelf: 'stretch',
    backgroundColor: ocean.bg.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: ocean.border.subtle,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  calcBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: ocean.accent.green,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  calcBtnDisabled: {
    opacity: 0.4,
  },
  calcBtnTxt: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: ocean.bg.deep,
  },

  resultArea: {
    alignSelf: 'stretch',
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: ocean.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  whatIfError: {
    fontSize: fontSize.xs,
    color: ocean.accent.red,
  },
});
