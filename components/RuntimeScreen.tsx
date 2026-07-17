import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Gas, Plan, Plongee, Segment, ZH16CTissues } from '../lib/dive';
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

export default function RuntimeScreen() {
  const { setPlans } = usePedagogicalStore();
  const { plongeeList } = usePlongeeStore();

  // ── Paramètres ─────────────────────────────────────────────────────────────
  const [selectedPlongee, setSelectedPlongee] = useState<Plongee | null>(null);
  const { gfLow: defaultGfLow, gfHigh: defaultGfHigh } = usePreferencesStore();
  const [gfValues, setGfValues] = useState<GFValues>({
    gfLow: defaultGfLow,
    gfHigh: defaultGfHigh,
  });

  // ── Résultats ──────────────────────────────────────────────────────────────
  const [decoPlan, setDecoPlan] = useState<Segment[]>([]);
  const [decoObject, setDecoObject] = useState<Plan | null>(null);  // ← Plan conservé pour le mode péda
  const [showResult, setShowResult] = useState(false);

  // ── Calcul ─────────────────────────────────────────────────────────────────
  /**
   * Retourne à la fois les segments de résultat ET le Plan complet.
   * Le Plan est nécessaire pour buildDivePlanFromPlan() dans le mode pédagogique.
   */
  function computeDive(
    plongee: Plongee,
    gfLow: number,
    gfHigh: number,
  ): { segments: Segment[]; plan: Plan } {
    const deco = new Plan(ZH16CTissues);

    for (const gaz of plongee.gazFond.map(Gas.fromJSON)) {
      deco.addBottomGas(gaz);
    }
    for (const gaz of plongee.gazDeco.map(Gas.fromJSON)) {
      deco.addDecoGas(gaz);
    }

    let isFirstSegment = true;
    for (const segment of plongee.segments) {
      if (isFirstSegment && segment.startDepth === segment.endDepth) {
        deco.addDepthChange(0, segment.endDepth, segment.gasName, segment.endDepth / 20);
      } else if (segment.startDepth < segment.endDepth) {
        deco.addDepthChange(
          segment.startDepth, segment.endDepth,
          segment.gasName,
          (segment.endDepth - segment.startDepth) / 20,
        );
      } else if (segment.startDepth === segment.endDepth) {
        deco.addFlat(segment.startDepth, segment.gasName, segment.time);
      }
      isFirstSegment = false;
    }

    const decoSegments = deco.calculateDecompression(
      false, gfLow, gfHigh, 1.6, 30, undefined,
    );

    return { segments: decoSegments, plan: deco };
  }

  function handleSubmit() {
    if (!selectedPlongee) return;
    setShowResult(false);

    const { segments: runtime, plan } = computeDive(
      selectedPlongee,
      gfValues.gfLow,
      gfValues.gfHigh,
    );

    setDecoPlan([...selectedPlongee.segments, ...runtime]);
    setDecoObject(plan);          // ← Plan stocké pour le mode pédagogique
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

          <RuntimeResult data={decoPlan} />
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
});
