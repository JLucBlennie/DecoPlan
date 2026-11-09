// Choix de l'intervalle surface : boutons − / + et raccourcis.
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import { formatInterval } from './successiveFormat';

export const MAX_INTERVAL_MIN = 24 * 60;
const PRESETS_MIN = [0, 10, 15, 30, 60, 120, 240, 720];

/** Pas plus fin au début de l'intervalle, là où les tables MN90 changent vite. */
function stepFor(min: number): number {
  if (min < 60) return 5;
  if (min < 240) return 15;
  return 30;
}

type Props = { value: number; onChange: (min: number) => void };

export default function IntervalControl({ value, onChange }: Props) {
  const clamp = (v: number) => Math.max(0, Math.min(MAX_INTERVAL_MIN, v));
  const down = () => onChange(clamp(value - stepFor(value - 1)));
  const up = () => onChange(clamp(value + stepFor(value)));

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.stepBtn} onPress={down} accessibilityLabel="Diminuer l'intervalle">
          <Text style={styles.stepTxt}>−</Text>
        </TouchableOpacity>
        <Text style={styles.value}>{formatInterval(value)}</Text>
        <TouchableOpacity style={styles.stepBtn} onPress={up} accessibilityLabel="Augmenter l'intervalle">
          <Text style={styles.stepTxt}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.presets}>
        {PRESETS_MIN.map(preset => (
          <TouchableOpacity
            key={preset}
            style={[styles.chip, preset === value && styles.chipActive]}
            onPress={() => onChange(preset)}
          >
            <Text style={[styles.chipTxt, preset === value && styles.chipTxtActive]}>
              {preset === 0 ? '0' : formatInterval(preset)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch', backgroundColor: ocean.bg.surface, borderRadius: radius.md,
    borderWidth: 0.5, borderColor: ocean.border.subtle, padding: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: ocean.bg.raised, borderWidth: 0.5, borderColor: ocean.border.subtle,
  },
  stepTxt: { fontSize: 24, color: ocean.text.primary },
  value: { fontSize: 28, fontWeight: '600', color: ocean.text.primary },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: { backgroundColor: 'rgba(55,138,221,0.2)', borderColor: ocean.accent.blue },
  chipTxt: { fontSize: fontSize.xs, color: ocean.text.muted },
  chipTxtActive: { color: '#85B7EB' },
});
