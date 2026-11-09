// Remontée de la plongée 2 selon l'intervalle : Bühlmann (bleu) et MN90 (vert).
import { StyleSheet, Text, View } from 'react-native';

import type { IntervalSweepPoint } from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import { formatInterval } from './successiveFormat';

type Props = { points: IntervalSweepPoint[]; currentIntervalMin: number };

export default function IntervalSweepChart({ points, currentIntervalMin }: Props) {
  const max = Math.max(1, ...points.flatMap(p => [p.secondTtsMin, p.mn90SecondTtsMin ?? 0]));
  // Ligne mise en évidence : la plus grande valeur de la courbe ≤ intervalle choisi.
  const current = points.filter(p => p.surfaceIntervalMin <= currentIntervalMin).pop();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Effet de l'intervalle sur la plongée 2 (remontée, min)</Text>
      {points.map(p => {
        const highlighted = p === current;
        return (
          <View key={p.surfaceIntervalMin} style={[styles.row, highlighted && styles.rowActive]}>
            <Text style={styles.interval}>{formatInterval(p.surfaceIntervalMin)}</Text>
            <View style={styles.bars}>
              <View style={styles.barLine}>
                <View style={[styles.bar, { width: `${(p.secondTtsMin / max) * 100}%`, backgroundColor: ocean.accent.blue }]} />
                <Text style={styles.num}>{Math.round(p.secondTtsMin)}</Text>
              </View>
              <View style={styles.barLine}>
                {p.mn90SecondTtsMin !== undefined ? (
                  <>
                    <View style={[styles.bar, { width: `${(p.mn90SecondTtsMin / max) * 100}%`, backgroundColor: ocean.accent.teal }]} />
                    <Text style={styles.num}>{p.mn90SecondTtsMin}</Text>
                  </>
                ) : (
                  <Text style={styles.num}>hors table</Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch', backgroundColor: ocean.bg.surface, borderRadius: radius.md,
    borderWidth: 0.5, borderColor: ocean.border.subtle, padding: spacing.md,
  },
  title: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 3, paddingHorizontal: 4, borderRadius: 4 },
  rowActive: { backgroundColor: 'rgba(55,138,221,0.14)' },
  interval: { width: 56, fontSize: fontSize.xs, color: ocean.text.secondary },
  bars: { flex: 1, gap: 2 },
  barLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, height: 10 },
  bar: { height: 8, borderRadius: 2, minWidth: 1 },
  num: { fontSize: 10, color: ocean.text.muted },
});
