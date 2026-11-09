// Azote en excès encore dissous à la remise à l'eau, par compartiment.
import { StyleSheet, Text, View } from 'react-native';

import type { CompartmentDesaturation } from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';

/** Part (0..1) de l'excès d'azote de la sortie de l'eau qui reste à la remise à l'eau. */
export function remainingExcessRatio(c: CompartmentDesaturation): number {
  const excessAtExit = c.n2AfterDive1Bar - c.n2SurfaceSaturationBar;
  if (excessAtExit <= 1e-6) return 0;
  const remaining = (c.n2AtSecondDiveBar - c.n2SurfaceSaturationBar) / excessAtExit;
  return Math.max(0, Math.min(1, remaining));
}

const barColor = (r: number) => (r > 0.88 ? '#D85A30' : r > 0.68 ? '#BA7517' : '#1D9E75');

function formatHalfTime(min: number): string {
  return Number.isInteger(min) ? `${min}′` : `${min.toFixed(1)}′`;
}

export default function DesaturationPanel({ compartments }: { compartments: CompartmentDesaturation[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Azote en excès restant à la remise à l'eau</Text>
      <Text style={styles.hint}>
        100 % = tissu aussi chargé qu'à la sortie de l'eau ; 0 % = revenu à l'équilibre avec la surface.
        Les compartiments lents (T½ élevée) gardent leur excès : c'est l'azote résiduel.
      </Text>
      {compartments.map((c, i) => {
        const ratio = remainingExcessRatio(c);
        const pct = Math.round(ratio * 100);
        return (
          <View key={i} style={styles.row}>
            <Text style={styles.name}>{i + 1}</Text>
            <Text style={styles.half}>T½ {formatHalfTime(c.halfTimeMin)}</Text>
            <View style={styles.barOuter}>
              <View style={[styles.barInner, { width: `${pct}%`, backgroundColor: barColor(ratio) }]} />
            </View>
            <Text style={[styles.pct, { color: barColor(ratio) }]}>{pct}%</Text>
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
  title: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
  hint: { fontSize: fontSize.xs, color: ocean.text.muted, marginTop: spacing.xs, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 2 },
  name: { width: 18, textAlign: 'right', fontSize: fontSize.xs, color: ocean.text.muted },
  half: { width: 64, fontSize: fontSize.xs, color: ocean.text.muted },
  barOuter: { flex: 1, height: 8, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)' },
  barInner: { height: '100%' },
  pct: { width: 40, textAlign: 'right', fontSize: fontSize.xs },
});
