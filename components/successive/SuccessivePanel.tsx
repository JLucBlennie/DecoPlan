// Contenu du mode « 2 plongées » : intervalle surface, puis Bühlmann comparé à MN90.
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  computeIntervalSweep, computeSuccessive, definitionFromPlongee, mn90Notes,
  type DiveSettings, type Plongee,
} from '../../lib/dive';
import { sharedStyles } from '../../styles/sharedStyles';
import { fontSize, ocean, spacing } from '../../styles/theme';
import DesaturationPanel from './DesaturationPanel';
import IntervalControl from './IntervalControl';
import IntervalSweepChart from './IntervalSweepChart';
import SuccessiveComparison from './SuccessiveComparison';

const SWEEP_INTERVALS_MIN = [0, 15, 30, 60, 120, 180, 240, 360, 480, 720];
const DEFAULT_INTERVAL_MIN = 60;

type Props = { first: Plongee; second: Plongee; settings: DiveSettings };

export default function SuccessivePanel({ first, second, settings }: Props) {
  const [intervalMin, setIntervalMin] = useState(DEFAULT_INTERVAL_MIN);

  // Le balayage ne dépend pas de l'intervalle choisi : il n'est recalculé que si les plongées ou réglages changent.
  const computed = useMemo(() => {
    try {
      const defs = {
        first: definitionFromPlongee(first, settings),
        second: definitionFromPlongee(second, settings),
      };
      return {
        defs,
        sweep: computeIntervalSweep(defs, SWEEP_INTERVALS_MIN),
        notes: mn90Notes(defs.first, defs.second),
        error: null as string | null,
      };
    } catch (e) {
      return { defs: null, sweep: [], notes: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [first, second, settings]);

  const result = useMemo(
    () => (computed.defs ? computeSuccessive({ ...computed.defs, surfaceIntervalMin: intervalMin }) : null),
    [computed, intervalMin],
  );

  return (
    <View style={styles.root}>
      <Text style={sharedStyles.sectionLabel}>Intervalle surface</Text>
      <IntervalControl value={intervalMin} onChange={setIntervalMin} />

      {computed.error && <Text style={styles.error}>Calcul impossible : {computed.error}</Text>}
      {result && (
        <View style={styles.results}>
          {computed.notes.map(text => (
            <Text key={text} style={styles.note}>ℹ {text}</Text>
          ))}
          <SuccessiveComparison result={result} />
          <DesaturationPanel compartments={result.desaturation} />
          <IntervalSweepChart points={computed.sweep} currentIntervalMin={intervalMin} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch', gap: spacing.sm },
  results: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
  note: { fontSize: fontSize.xs, color: ocean.text.secondary },
  error: { fontSize: fontSize.sm, color: ocean.accent.red },
});
