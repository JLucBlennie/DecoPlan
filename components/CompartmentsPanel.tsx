// components/CompartmentsPanel.tsx
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { ZHL16C_N2 } from '../lib/dive/constants';
import type { SimulationFrame } from '../lib/dive/types';

export interface CompartmentsPanelProps {
  frame: SimulationFrame;
  numCompartments?: 8 | 16 | 17;
  label?: string;
  style?: ViewStyle;
  /** Mode compact : barres sans texte %, pour affichage 1/4 de largeur */
  compact?: boolean;
  /** Frame de comparaison → double barre par compartiment */
  comparisonFrame?: SimulationFrame;
  comparisonLabel?: string;
}

export function CompartmentsPanel({
  frame, numCompartments = 16, label, style,
  compact = false, comparisonFrame, comparisonLabel,
}: CompartmentsPanelProps) {

  const nc = Math.min(numCompartments, ZHL16C_N2.length);
  const { saturationRatios, leadingCompartmentIndex } = frame;
  const hasComparison = !!comparisonFrame;

  const satColor = (r: number) =>
    r > 0.88 ? '#D85A30' : r > 0.68 ? '#BA7517' : '#1D9E75';

  return (
    <View style={[styles.card, style]}>

      {/* En-tête */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle} numberOfLines={1}>Compart. N₂</Text>
        <Text style={styles.leadingBadge} numberOfLines={1}>
          C{leadingCompartmentIndex + 1}↑
        </Text>
      </View>

      {/* Labels comparaison */}
      {hasComparison && (
        <View style={styles.compLabels}>
          <View style={[styles.compLabelDot, { backgroundColor: '#378ADD' }]} />
          <Text style={styles.compLabelTxt}>{label ?? 'A'}</Text>
          <View style={[styles.compLabelDot, { backgroundColor: '#1D9E75' }]} />
          <Text style={styles.compLabelTxt}>{comparisonLabel ?? 'B'}</Text>
        </View>
      )}

      {/* Liste des compartiments — scrollable */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {Array.from({ length: nc }, (_, i) => {
          const ratioA = Math.min(1, saturationRatios[i] ?? 0);
          const ratioB = hasComparison
            ? Math.min(1, comparisonFrame!.saturationRatios[i] ?? 0)
            : null;
          const isLeading = i === leadingCompartmentIndex;
          const colorA = satColor(ratioA);
          const colorB = ratioB !== null ? satColor(ratioB) : null;
          const pctA = Math.round(ratioA * 100);
          const pctB = ratioB !== null ? Math.round(ratioB * 100) : null;

          return (
            <View key={i} style={[styles.row, isLeading && styles.rowHighlight]}>

              {/* Label C1 … C16 */}
              <Text style={[styles.compName, isLeading && styles.compNameActive]}>
                {i + 1}
              </Text>

              {/* Zone barres */}
              <View style={styles.barsCol}>

                {/* Barre A */}
                <View style={styles.barOuter}>
                  <View style={[styles.barInner, { width: `${pctA}%` as any, backgroundColor: colorA }]} />
                  <View style={styles.mValueLine} />
                </View>

                {/* Barre B (comparaison) */}
                {ratioB !== null && (
                  <View style={[styles.barOuter, styles.barOuterB]}>
                    <View style={[styles.barInner, { width: `${pctB}%` as any, backgroundColor: colorB! + 'CC' }]} />
                    <View style={styles.mValueLine} />
                  </View>
                )}
              </View>

              {/* Pourcentage — masqué en mode compact */}
              {!compact && (
                <Text style={[styles.pctTxt, { color: colorA }]}>{pctA}%</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Légende */}
      <View style={styles.legend}>
        <LegendDot color="#1D9E75" label="<68" />
        <LegendDot color="#BA7517" label="<88" />
        <LegendDot color="#D85A30" label=">88" />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendTxt}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#0D1526',
    borderRadius: 12, borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 8,
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 9, fontWeight: '500', color: '#5F5E5A',
    textTransform: 'uppercase', letterSpacing: 0.5, flex: 1,
  },
  leadingBadge: { fontSize: 9, color: '#85B7EB', fontWeight: '500' },

  compLabels: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4,
  },
  compLabelDot: { width: 6, height: 6, borderRadius: 3 },
  compLabelTxt: { fontSize: 8, color: '#5F5E5A', marginRight: 4 },

  scroll: { flex: 1 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    gap: 3, paddingVertical: 2, paddingHorizontal: 2,
    borderRadius: 3, marginBottom: 1,
  },
  rowHighlight: { backgroundColor: 'rgba(55,138,221,0.12)' },

  compName: {
    fontSize: 8, color: '#5F5E5A',
    width: 14, textAlign: 'right',
  },
  compNameActive: { color: '#85B7EB', fontWeight: '500' },

  barsCol: { flex: 1, gap: 2 },

  barOuter: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 1.5, overflow: 'hidden',
    position: 'relative',
  },
  barOuterB: {
    height: 5,
    opacity: 0.85,
  },
  barInner: { height: '100%', borderRadius: 1.5 },
  mValueLine: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 1, backgroundColor: 'rgba(255,255,255,0.2)',
  },

  pctTxt: { fontSize: 8, width: 22, textAlign: 'right' },

  legend: {
    flexDirection: 'row', gap: 5, marginTop: 5, flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  legendDot: { width: 5, height: 5, borderRadius: 1 },
  legendTxt: { fontSize: 7, color: '#444441' },
});