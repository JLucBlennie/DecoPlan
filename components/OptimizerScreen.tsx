// components/OptimizerScreen.tsx
// Mode « Optimiser » : temps de fond le plus long compatible avec les blocs, gaz et limites choisis.
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';

import {
  candidatePlongee,
  computeWhatIf, defaultGfFor,
  findMaxBottomTime,
  type DiveSettings, type Gas, type OptimizerCriteria, type OptimizerResult, type WhatIfResult
} from '../lib/dive';
import { useGazStore } from '../store/useGazStore';
import { usePlongeeStore } from '../store/usePlongeeStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { sharedStyles } from '../styles/sharedStyles';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import OptimizerCriteriaForm from './optimizer/OptimizerCriteriaForm';
import { criteriaFromDraft, initialDraft, type OptimizerDraft } from './optimizer/optimizerDraft';
import OptimizerResultView from './optimizer/OptimizerResultView';

type Computation = { criteria: OptimizerCriteria; result: OptimizerResult; whatIf: WhatIfResult } | { error: string } | null;

export default function OptimizerScreen() {
  const prefs = usePreferencesStore();
  const { gazList } = useGazStore();
  const { addPlongee } = usePlongeeStore();

  const [draft, setDraft] = useState<OptimizerDraft>(
    () => initialDraft({ bottomBar: prefs.reserveBottomBar, decoBar: prefs.reserveDecoBar }),
  );
  const [customGases, setCustomGases] = useState<Gas[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const gases = useMemo(() => [...gazList, ...customGases], [gazList, customGases]);
  const patch = (p: Partial<OptimizerDraft>) => { setDraft(d => ({ ...d, ...p })); setSavedName(null); };

  // Recalcul à chaque changement de critère : quelques dizaines de ms.
  const computation: Computation = useMemo(() => {
    const criteria = criteriaFromDraft(draft, gases);
    if (!criteria) return null;
    try {
      const gf = defaultGfFor(prefs, candidatePlongee(criteria, 1, ''));
      const settings: DiveSettings = {
        gfLow: gf.gfLow, gfHigh: gf.gfHigh,
        descentRateMMin: prefs.descentRateMMin, ascentRateMMin: prefs.ascentRateMMin,
        ascentRateBetweenStopsMMin: prefs.ascentRateBetweenStopsMMin,
        rmv: { fondLMin: prefs.rmvFond, decoLMin: prefs.rmvDeco },
        gasReserves: criteria.reserves,
      };
      const result = findMaxBottomTime(criteria, settings);
      return { criteria, result, whatIf: computeWhatIf(result.evaluation.definition) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [draft, gases, prefs]);

  const ok = computation && 'result' in computation ? computation : null;
  const shownName = name ?? ok?.result.plongee.name ?? '';

  const save = async () => {
    if (!ok) return;
    const plongee = { ...ok.result.plongee, id: uuid.v4() as string, name: shownName };
    await addPlongee(plongee);
    setSavedName(plongee.name);
  };

  return (
    <SafeAreaView style={sharedStyles.screenContainer} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={sharedStyles.screenTitle}>Optimiser une plongée</Text>
        <Text style={styles.intro}>
          Choisis profondeur, gaz et blocs : on cherche le temps de fond le plus long qui tient, puis on calcule les runtimes.
        </Text>

        <OptimizerCriteriaForm
          draft={draft} gases={gases} onChange={patch}
          onAddCustomGas={gas => setCustomGases(list => [...list, gas])}
        />

        {!computation && <Text style={styles.hint}>Choisis un gaz de fond pour lancer la recherche.</Text>}
        {computation && 'error' in computation && <Text style={styles.error}>Calcul impossible : {computation.error}</Text>}
        {ok && <OptimizerResultView result={ok.result} whatIf={ok.whatIf} criteria={ok.criteria} planName={shownName} />}

        {/*ok?.result.feasible && (
          <OptimizerPedagogicalButton
            definition={ok.result.evaluation.definition} criteria={ok.criteria} planName={shownName}
          />
        )*/}

        {ok?.result.feasible && (
          <View style={styles.saveCard}>
            <Text style={styles.saveTitle}>Créer la plongée</Text>
            <TextInput style={styles.input} value={shownName} onChangeText={setName}
              placeholder="Nom de la plongée" placeholderTextColor={ocean.text.muted} />
            <TouchableOpacity style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveBtnTxt}>Enregistrer dans mes plongées</Text>
            </TouchableOpacity>
            {savedName && <Text style={styles.saved}>« {savedName} » enregistrée.</Text>}
          </View>
        )}
        <Text style={styles.caution}>⚠ Outil pédagogique : à montrer pour comprendre, pas pour plonger.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { alignSelf: 'stretch' },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  intro: { fontSize: fontSize.sm, color: ocean.text.secondary },
  hint: { fontSize: fontSize.sm, color: ocean.text.muted },
  error: { fontSize: fontSize.sm, color: ocean.accent.red },
  caution: { fontSize: fontSize.xs, color: '#BA7517' },
  saveCard: {
    alignSelf: 'stretch', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md,
    backgroundColor: ocean.bg.surface, borderWidth: 0.5, borderColor: ocean.border.subtle,
  },
  saveTitle: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
  input: {
    borderWidth: 0.5, borderColor: ocean.border.subtle, borderRadius: radius.sm, padding: spacing.sm,
    color: ocean.text.primary, fontSize: fontSize.sm,
  },
  saveBtn: { alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, backgroundColor: ocean.accent.teal },
  saveBtnTxt: { fontSize: fontSize.sm, fontWeight: '600', color: ocean.bg.deep },
  saved: { fontSize: fontSize.xs, color: ocean.accent.teal },
});
