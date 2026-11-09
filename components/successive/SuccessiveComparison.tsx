// Bühlmann et MN90 côte à côte pour la même paire de plongées.
import { StyleSheet, Text, View } from 'react-native';

import {
  deltaTrend, formatDeltaMinutes, formatMinutes, type SuccessiveResult,
} from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import { formatBuhlmannStops, formatMn90Stops, RELATION_LABELS } from './successiveFormat';

const TREND_COLOR = { worse: ocean.accent.red, better: ocean.accent.teal, same: ocean.text.muted } as const;

function Line({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

function BuhlmannCard({ result }: { result: SuccessiveResult }) {
  const { first, second, secondAlone } = result;
  const delta = second.summary.ttsMin - secondAlone.summary.ttsMin;
  return (
    <View style={styles.card}>
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
    </View>
  );
}

function Mn90Card({ result }: { result: SuccessiveResult }) {
  const { mn90 } = result;
  const second = mn90.secondDive;
  return (
    <View style={styles.card}>
      <Text style={[styles.title, { color: ocean.accent.teal }]}>Tables MN90</Text>
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
    </View>
  );
}

export default function SuccessiveComparison({ result }: { result: SuccessiveResult }) {
  return (
    <View style={styles.root}>
      <BuhlmannCard result={result} />
      <Mn90Card result={result} />
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
