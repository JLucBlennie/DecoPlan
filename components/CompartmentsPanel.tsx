// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — CompartmentsPanel
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { ZHL16C_N2 } from '../lib/dive/constants';
import type { SimulationFrame } from '../lib/dive/types';

export interface CompartmentsPanelProps {
  frame: SimulationFrame;
  numCompartments?: 8 | 16;
  label?: string;
  style?: ViewStyle;
}

export function CompartmentsPanel({
  frame, numCompartments = 16, label, style,
}: CompartmentsPanelProps) {

  const nc = Math.min(numCompartments, ZHL16C_N2.length);
  const { saturationRatios, leadingCompartmentIndex } = frame;

  return (
    <View style={[styles.card, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Compartiments N₂</Text>
        <Text style={styles.leadingBadge}>
          {`↑ C${leadingCompartmentIndex + 1} limitant`}
        </Text>
      </View>

      {/* Barres */}
      {Array.from({ length: nc }, (_, i) => {
        const ratio = saturationRatios[i] ?? 0;
        const pct = Math.min(100, ratio * 100);
        const isLeading = i === leadingCompartmentIndex;
        const color = ratio > 0.88 ? '#D85A30' : ratio > 0.68 ? '#BA7517' : '#1D9E75';

        return (
          <View key={i} style={[styles.row, isLeading && styles.rowHighlight]}>
            {/* Label compartiment */}
            <Text style={[styles.compName, isLeading && styles.compNameActive]}>
              C{i + 1}
            </Text>

            {/* Barre */}
            <View style={styles.barOuter}>
              <View style={[styles.barInner, { width: `${pct}%` as any, backgroundColor: color }]} />
              {/* Trait à 100% (limite M-value) */}
              <View style={styles.mValueLine} />
            </View>

            {/* Valeur % */}
            <Text style={[styles.pctTxt, { color }]}>
              {Math.round(pct)}%
            </Text>

            {/* Demi-période (masquée si pas assez de place — visible uniquement sur les rapides) */}
            {i < 8 && (
              <Text style={styles.htTxt}>{ZHL16C_N2[i].halfTime}'</Text>
            )}
          </View>
        );
      })}

      {/* Légende */}
      <View style={styles.legend}>
        <LegendDot color="#1D9E75" label="< 68%" />
        <LegendDot color="#BA7517" label="68–88%" />
        <LegendDot color="#D85A30" label="> 88%" />
        <View style={[styles.legendItem, { gap: 3 }]}>
          <View style={styles.highlightSwatch} />
          <Text style={styles.legendTxt}>Limitant</Text>
        </View>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D1526',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 10,
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '500', color: '#5F5E5A',
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  label: { fontSize: 10, color: '#378ADD', marginBottom: 2 },
  leadingBadge: { fontSize: 10, color: '#85B7EB' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, paddingVertical: 2, paddingHorizontal: 3,
    borderRadius: 3, marginBottom: 2,
  },
  rowHighlight: { backgroundColor: 'rgba(55,138,221,0.12)' },

  compName: {
    fontSize: 9, color: '#5F5E5A', width: 18, textAlign: 'right',
  },
  compNameActive: { color: '#85B7EB', fontWeight: '500' },

  barOuter: {
    flex: 1, height: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2, overflow: 'hidden',
    position: 'relative',
  },
  barInner: { height: '100%', borderRadius: 2 },
  mValueLine: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 1.5, backgroundColor: 'rgba(255,255,255,0.2)',
  },

  pctTxt: { fontSize: 9, width: 26, textAlign: 'right' },
  htTxt:  { fontSize: 8, color: '#444441', width: 22, textAlign: 'right' },

  legend: {
    flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendDot: { width: 7, height: 7, borderRadius: 1.5 },
  highlightSwatch: {
    width: 7, height: 7, borderRadius: 1.5,
    backgroundColor: 'rgba(55,138,221,0.25)',
    borderWidth: 0.5, borderColor: '#378ADD',
  },
  legendTxt: { fontSize: 9, color: '#5F5E5A' },
});
