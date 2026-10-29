// components/WhatIfColumn.tsx
// Une colonne = un runtime (nominal ou scénario) : écarts en tête, puis phase par phase.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
    deltaTrend, formatDeltaMinutes, formatMinutes, toRuntimeRows,
    type RuntimeRow, type WhatIfRuntime,
} from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import { KIND_META, TREND_COLOR } from './runtimeKindMeta';

type Props = {
    runtime: WhatIfRuntime;
    width: number;
    /** Vrai pour le nominal : colonne de référence, sans écarts. */
    isReference?: boolean;
};

function formatDepth(depthM: number): string {
    return String(Math.round(depthM * 10) / 10);
}

function depthLabel(row: RuntimeRow): string {
    return row.startDepthM === row.endDepthM
        ? `${formatDepth(row.endDepthM)} m`
        : `${formatDepth(row.startDepthM)}→${formatDepth(row.endDepthM)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────────────────────

export default function WhatIfColumn({ runtime, width, isReference = false }: Props) {
    const { summary, delta, warnings } = runtime;
    const rows = useMemo(() => toRuntimeRows(runtime.segments), [runtime.segments]);

    return (
        <View style={[styles.column, { width }, isReference && styles.reference]}>

            {/* En-tête : libellé + durée totale */}
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>{runtime.label}</Text>
                <View style={styles.totalRow}>
                    <Text style={styles.total}>{formatMinutes(summary.totalTimeMin)}'</Text>
                    {delta && <Delta value={delta.totalTimeMin} unit="'" />}
                </View>
            </View>

            {/* Chiffres clés */}
            <View style={styles.metrics}>
                <Metric label="Remontée" value={`${formatMinutes(summary.ttsMin)}'`}
                    delta={delta?.ttsMin} unit="'" />
                <Metric label="Paliers" value={`${formatMinutes(summary.decoTimeMin)}'`}
                    delta={delta?.decoTimeMin} unit="'" />
                <Metric
                    label="1er palier"
                    value={summary.stops.length > 0 ? `${formatDepth(summary.firstStopDepthM)} m` : '—'}
                    delta={delta?.firstStopDepthM} unit=" m" />
            </View>

            {/* Avertissements (PpO₂ au fond…) */}
            {warnings.map(text => (
                <View key={text} style={styles.warning}>
                    <MaterialIcons name="warning" size={12} color="#BA7517" />
                    <Text style={styles.warningTxt}>{text}</Text>
                </View>
            ))}

            {/* Phases */}
            <View style={styles.tableHeader}>
                <Text style={[styles.hCell, styles.colDepth]}>Prof.</Text>
                <Text style={[styles.hCell, styles.colTime]}>Durée</Text>
                <Text style={[styles.hCell, styles.colRuntime]}>Runtime</Text>
            </View>
            {rows.map((row, i) => {
                const meta = KIND_META[row.kind];
                return (
                    <View key={i} style={[styles.row, { backgroundColor: meta.bg }]}>
                        <View style={[styles.bar, { backgroundColor: meta.color }]} />
                        <View style={styles.colDepth}>
                            <Text style={styles.cellTxt}>{depthLabel(row)}</Text>
                            {row.gasSwitch && (
                                <Text style={styles.gasTxt} numberOfLines={1}>{row.gasName}</Text>
                            )}
                        </View>
                        <Text style={[styles.cellTxt, styles.colTime]}>
                            {formatMinutes(row.durationMin)}'
                        </Text>
                        <Text style={[styles.cellTxt, styles.runtimeTxt, styles.colRuntime]}>
                            {formatMinutes(row.cumulativeMin)}'
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

// ── Sous-composants ───────────────────────────────────────────────────────────

/** Écart avec le nominal : ambre si plus long/profond, teal si plus court/léger. */
function Delta({ value, unit }: { value: number; unit: string }) {
    return (
        <Text style={[styles.delta, { color: TREND_COLOR[deltaTrend(value)] }]}>
            {formatDeltaMinutes(value)}{unit}
        </Text>
    );
}

function Metric({ label, value, delta, unit }: {
    label: string; value: string; delta?: number; unit: string;
}) {
    return (
        <View style={styles.metric}>
            <Text style={styles.metricLabel}>{label}</Text>
            <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{value}</Text>
                {delta !== undefined && <Delta value={delta} unit={unit} />}
            </View>
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    column: {
        backgroundColor: ocean.bg.surface,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
        overflow: 'hidden',
    },
    reference: { borderColor: ocean.accent.blue },

    header: {
        padding: spacing.sm,
        gap: 2,
        backgroundColor: ocean.bg.raised,
    },
    title: { fontSize: fontSize.xs, fontWeight: '600', color: ocean.text.secondary, minHeight: 28 },
    totalRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
    total: { fontSize: fontSize.md, fontWeight: '600', color: ocean.text.primary },
    delta: { fontSize: fontSize.xs, fontWeight: '600' },

    metrics: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, gap: 2 },
    metric: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    metricLabel: { fontSize: 10, color: ocean.text.muted },
    metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    metricValue: { fontSize: fontSize.xs, color: ocean.text.primary },

    warning: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 4,
        marginHorizontal: spacing.sm, marginBottom: spacing.xs,
    },
    warningTxt: { fontSize: 9, color: '#BA7517', flex: 1 },

    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 4, paddingLeft: 6,
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ocean.border.subtle,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ocean.border.subtle,
    },
    hCell: {
        fontSize: 9, fontWeight: '600', color: ocean.text.muted,
        textTransform: 'uppercase', letterSpacing: 0.2, textAlign: 'center',
    },

    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 5, paddingLeft: 6,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ocean.border.subtle,
    },
    bar: { position: 'absolute', left: 0, top: 4, bottom: 4, width: 2.5, borderRadius: 2 },
    cellTxt: { fontSize: fontSize.xs, color: ocean.text.primary, textAlign: 'center' },
    runtimeTxt: { fontWeight: '500', color: ocean.text.secondary },
    gasTxt: { fontSize: 9, color: ocean.accent.blue, textAlign: 'center' },

    colDepth: { flex: 2.2, alignItems: 'center' },
    colTime: { flex: 1.2 },
    colRuntime: { flex: 1.4 },
});
