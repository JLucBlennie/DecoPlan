// Bühlmann et MN90 côte à côte pour la même paire de plongées.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  deltaTrend, formatDeltaMinutes, formatMinutes, type SuccessiveResult,
} from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import { CURVE_COLORS, type CurveId } from './successiveCurves';
import { formatBuhlmannStops, formatDciemStops, formatMn90Stops, RELATION_LABELS } from './successiveFormat';

const TREND_COLOR = { worse: ocean.accent.red, better: ocean.accent.teal, same: ocean.text.muted } as const;

type Selectable = { highlight: CurveId | null; onSelect: (id: CurveId) => void };

/** Panneau d'un modèle : encadré de la couleur de sa courbe quand elle est mise en évidence. */
function ModelCard({ id, highlight, onSelect, children }: Selectable & { id: CurveId; children: React.ReactNode }) {
  const selected = highlight === id;
  return (
    <Pressable
      style={[styles.card, selected && { borderColor: CURVE_COLORS[id], borderWidth: 1.5 }]}
      onPress={() => onSelect(id)}
      accessibilityState={{ selected }}
    >
      {children}
    </Pressable>
  );
}

function Line({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

function BuhlmannCard({ result, ...sel }: { result: SuccessiveResult } & Selectable) {
  const { first, second, secondAlone } = result;
  const delta = second.summary.ttsMin - secondAlone.summary.ttsMin;
  return (
    <ModelCard id="BUHLMANN" {...sel}>
      <Text style={[styles.title, { color: ocean.accent.blue }]}>Bühlmann ZHL-16C</Text>
      <Line label="Plongée 1 : remontée" value={`${formatMinutes(first.summary.ttsMin)} min`} />
      <Text style={styles.stops}>{formatBuhlmannStops(first.summary.stops)}</Text>
      <Line label="Plongée 2 : remontée" value={`${formatMinutes(second.summary.ttsMin)} min`} />
      <Text style={styles.stops}>{formatBuhlmannStops(second.summary.stops)}</Text>
      <Line label="Plongée 2 seule" value={`${formatMinutes(secondAlone.summary.ttsMin)} min`} />
      <Line
        label="Effet des tissus chargés"
        value={`${formatDeltaMinutes(delta)} min`}
        color={TREND_COLOR[deltaTrend(delta)]}
      />
    </ModelCard>
  );
}

function Mn90Card({ result, ...sel }: { result: SuccessiveResult } & Selectable) {
  const { mn90 } = result;
  const second = mn90.secondDive;
  return (
    <ModelCard id="MN90" {...sel}>
      <Text style={[styles.title, { color: CURVE_COLORS.MN90 }]}>Tables MN90</Text>
      <Text style={styles.relation}>{RELATION_LABELS[mn90.relation]}</Text>
      {mn90.detail && (
        <>
          <Line label="GPS plongée 1" value={mn90.detail.gpsFirst} />
          <Line label={`Azote résiduel (col. ${mn90.detail.intervalColumnMin} min)`} value={mn90.detail.residualN2.toFixed(2)} />
          <Line label={`Majoration (col. ${mn90.detail.depthColumnM} m)`} value={`${mn90.detail.majorationMin} min`} />
          <Line label="Temps lu pour la plongée 2" value={`${mn90.detail.effectiveTimeMin} min`} />
        </>
      )}
      {mn90.merged && (
        <Line label="Plongée unique équivalente" value={`${mn90.merged.maxDepthM} m / ${mn90.merged.diveTimeMin} min`} />
      )}
      {second ? (
        <>
          <Line label="Plongée 2 : remontée" value={`${second.totalAscentTimeMin} min`} />
          <Text style={styles.stops}>{formatMn90Stops(second.stops)}</Text>
        </>
      ) : (
        <Text style={styles.unavailable}>{mn90.unavailableReason ?? 'Hors table.'}</Text>
      )}
    </ModelCard>
  );
}

function DciemCard({ result, ...sel }: { result: SuccessiveResult } & Selectable) {
  const { first, second, secondAlone } = result.dciem;
  const delta = second.totalAscentTimeMin - secondAlone.totalAscentTimeMin;
  return (
    <ModelCard id="DCIEM" {...sel}>
      <Text style={[styles.title, { color: CURVE_COLORS.DCIEM }]}>DCIEM (modèle calculé)</Text>
      <Text style={styles.relation}>Calcul du modèle sur l'état des compartiments, pas une lecture de table.</Text>
      <Line label="Plongée 1 : remontée" value={`${formatMinutes(first.totalAscentTimeMin)} min`} />
      <Text style={styles.stops}>{formatDciemStops(first.stops)}</Text>
      <Line label="Plongée 2 : remontée" value={`${formatMinutes(second.totalAscentTimeMin)} min`} />
      <Text style={styles.stops}>{formatDciemStops(second.stops)}</Text>
      <Line label="Plongée 2 seule" value={`${formatMinutes(secondAlone.totalAscentTimeMin)} min`} />
      <Line
        label="Effet des compartiments chargés"
        value={`${formatDeltaMinutes(delta)} min`}
        color={TREND_COLOR[deltaTrend(delta)]}
      />
    </ModelCard>
  );
}

export default function SuccessiveComparison({ result, highlight, onSelect }: { result: SuccessiveResult } & Selectable) {
  return (
    <View style={styles.root}>
      <BuhlmannCard result={result} highlight={highlight} onSelect={onSelect} />
      <Mn90Card result={result} highlight={highlight} onSelect={onSelect} />
      <DciemCard result={result} highlight={highlight} onSelect={onSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch', gap: spacing.sm },
  card: {
    backgroundColor: ocean.bg.surface, borderRadius: radius.md, borderWidth: 0.5,
    borderColor: ocean.border.subtle, padding: spacing.md,
  },
  title: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs },
  relation: { fontSize: fontSize.xs, color: ocean.text.muted, marginBottom: spacing.xs },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, paddingVertical: 2 },
  label: { flex: 1, fontSize: fontSize.xs, color: ocean.text.secondary },
  value: { fontSize: fontSize.sm, fontWeight: '600', color: ocean.text.primary },
  stops: { fontSize: fontSize.xs, color: ocean.text.muted, marginBottom: spacing.xs },
  unavailable: { fontSize: fontSize.xs, color: ocean.accent.red, marginTop: spacing.xs },
});
