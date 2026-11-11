// Point d'entrée du mode pédagogique : 1 plongée → rejeu animé et comparaison de GF,
// 2 plongées → plongées successives (Bühlmann comparé aux tables MN90).
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  computeRuntime, definitionFromPlongee, type DiveSettings, type Plongee,
} from '../lib/dive';
import { ROUTES } from '../navigation/types';
import { usePedagogicalStore } from '../store/usePedagogicalStore';
import { usePlongeeStore } from '../store/usePlongeeStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { sharedStyles } from '../styles/sharedStyles';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import { GFSliderPair, type GFValues } from './GFSliderPair';
import PedagogicalConfigPanel from './pedagogical/PedagogicalConfigPanel';
import PlongeePicker from './PlongeePicker';
import SegmentedToggle from './SegmentedToggle';
import SuccessivePanel from './successive/SuccessivePanel';

type Mode = 'single' | 'successive';

const MODES: { value: Mode; label: string }[] = [
  { value: 'single', label: '1 plongée' },
  { value: 'successive', label: '2 plongées (successives)' },
];

export default function PedagogicalSetupScreen() {
  const { setPlans } = usePedagogicalStore();
  const { plongeeList } = usePlongeeStore();
  const {
    gfLow: defaultGfLow, gfHigh: defaultGfHigh,
    descentRateMMin, ascentRateMMin, ascentRateBetweenStopsMMin,
  } = usePreferencesStore();

  const [mode, setMode] = useState<Mode>('single');
  const [first, setFirst] = useState<Plongee | null>(null);
  const [second, setSecond] = useState<Plongee | null>(null);
  const [gf, setGf] = useState<GFValues>({ gfLow: defaultGfLow, gfHigh: defaultGfHigh });

  const find = (id: string | null) => plongeeList.find(p => p.id === id) ?? null;

  const settings: DiveSettings = useMemo(() => ({
    gfLow: gf.gfLow, gfHigh: gf.gfHigh, descentRateMMin, ascentRateMMin, ascentRateBetweenStopsMMin,
  }), [gf, descentRateMMin, ascentRateMMin, ascentRateBetweenStopsMMin]);

  // Mode 1 plongée : les GF se règlent dans le panneau (réglage A / B) ; le Plan de départ
  // est calculé avec les GF par défaut des préférences.
  const single = useMemo(() => {
    if (mode !== 'single' || !first) return null;
    try {
      const base: DiveSettings = {
        gfLow: defaultGfLow, gfHigh: defaultGfHigh, descentRateMMin, ascentRateMMin, ascentRateBetweenStopsMMin,
      };
      return { plan: computeRuntime(definitionFromPlongee(first, base)).plan, error: null as string | null };
    } catch (e) {
      return { plan: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [mode, first, defaultGfLow, defaultGfHigh, descentRateMMin, ascentRateMMin, ascentRateBetweenStopsMMin]);

  return (
    <SafeAreaView style={sharedStyles.screenContainer} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={sharedStyles.screenTitle}>Mode pédagogique</Text>
        <SegmentedToggle value={mode} options={MODES} onChange={setMode} />
        <Text style={styles.intro}>
          {mode === 'single'
            ? "Rejeu animé de la saturation des tissus, avec comparaison de deux réglages de GF."
            : "Effet de l'intervalle surface sur la 2e plongée, Bühlmann comparé aux tables MN90."}
        </Text>

        <Text style={sharedStyles.sectionLabel}>{mode === 'single' ? 'Plongée' : 'Plongée 1'}</Text>
        <View style={styles.picker}>
          <PlongeePicker plongees={plongeeList} selectedId={first?.id ?? null} onSelect={id => setFirst(find(id))} />
        </View>

        {mode === 'successive' && (
          <>
            <Text style={[sharedStyles.sectionLabel, styles.spaced]}>Plongée 2</Text>
            <View style={styles.picker}>
              <PlongeePicker plongees={plongeeList} selectedId={second?.id ?? null} onSelect={id => setSecond(find(id))} />
            </View>
          </>
        )}

        {mode === 'successive' && (
          <>
            <Text style={[sharedStyles.sectionLabel, styles.spaced]}>Gradient Factors</Text>
            <View style={styles.gfCard}>
              <GFSliderPair values={gf} onChange={setGf} accentColor={ocean.accent.blue} />
            </View>
          </>
        )}
        <Text style={styles.caution}>
          ⚠ Des GF élevés raccourcissent les paliers mais réduisent la marge de sécurité : à montrer pour comprendre, pas pour plonger.
        </Text>

        {mode === 'single' && (
          <>
            {!first && <Text style={styles.hint}>Choisis une plongée pour lancer le mode pédagogique.</Text>}
            {single?.error && <Text style={styles.error}>Calcul impossible : {single.error}</Text>}
            {first && single?.plan && (
              <PedagogicalConfigPanel
                key={first.id}
                plan={single.plan}
                planName={first.name}
                currentGfLow={defaultGfLow}
                currentGfHigh={defaultGfHigh}
                onLaunch={(planA, planB) => {
                  setPlans(planA, planB);
                  router.push(ROUTES.PEDAGOGICAL);
                }}
              />
            )}
          </>
        )}

        {mode === 'successive' && (
          first && second
            ? <SuccessivePanel first={first} second={second} settings={settings} />
            : <Text style={styles.hint}>Choisis les deux plongées pour comparer Bühlmann et MN90.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Le conteneur d'écran centre ses enfants : sans stretch, le ScrollView se cale sur son contenu.
  scroll: { alignSelf: 'stretch' },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  intro: { fontSize: fontSize.sm, color: ocean.text.secondary },
  picker: {
    alignSelf: 'stretch', borderWidth: 1, borderColor: ocean.border.subtle, borderRadius: radius.md,
    backgroundColor: ocean.bg.surface, overflow: 'hidden',
  },
  spaced: { marginTop: spacing.sm },
  gfCard: {
    alignSelf: 'stretch', backgroundColor: ocean.bg.surface, borderRadius: radius.md,
    borderWidth: 0.5, borderColor: ocean.border.subtle, padding: spacing.md,
  },
  caution: { fontSize: fontSize.xs, color: '#BA7517' },
  hint: { fontSize: fontSize.sm, color: ocean.text.muted, marginTop: spacing.md },
  error: { fontSize: fontSize.sm, color: ocean.accent.red, marginTop: spacing.md },
});
