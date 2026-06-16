// components/RuntimeResult.tsx
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Segment } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

type Props = { data: Segment[] };

// ── Classification d'un segment ───────────────────────────────────────────────

type SegmentKind = 'descent' | 'bottom' | 'ascent' | 'deco';

function classifySegment(seg: Segment, maxDepth: number): SegmentKind {
    if (seg.endDepth > seg.startDepth) return 'descent';
    if (seg.startDepth < seg.endDepth) return 'ascent';
    if (seg.startDepth === seg.endDepth) {
        if (seg.startDepth >= maxDepth * 0.85) return 'bottom';
        return 'deco';
    }
    return 'ascent';
}

const KIND_META: Record<SegmentKind, { label: string; color: string; bg: string }> = {
    descent: { label: 'Descente', color: ocean.accent.blue, bg: 'rgba(55,138,221,0.1)' },
    bottom: { label: 'Fond', color: ocean.accent.teal, bg: 'rgba(29,158,117,0.08)' },
    ascent: { label: 'Remontée', color: ocean.text.muted, bg: 'transparent' },
    deco: { label: 'Palier', color: '#BA7517', bg: 'rgba(186,117,23,0.1)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────────────────────

export default function RuntimeResult({ data }: Props) {

    const maxDepth = useMemo(
        () => Math.max(...data.map(s => Math.max(s.startDepth, s.endDepth)), 0),
        [data],
    );

    // Calcul du temps cumulatif (bug corrigé : était toujours "0")
    const rows = useMemo(() => {
        let cumulative = 0;
        return data.map(seg => {
            cumulative += seg.time;
            return {
                seg,
                kind: classifySegment(seg, maxDepth),
                runtime: cumulative,
            };
        });
    }, [data, maxDepth]);

    // Résumé des paliers déco
    const decoStops = rows.filter(r => r.kind === 'deco');
    const totalDecoTime = decoStops.reduce((s, r) => s + r.seg.time, 0);

    if (data.length === 0) return null;

    return (
        <View style={styles.root}>

            {/* Résumé déco */}
            {decoStops.length > 0 ? (
                <View style={styles.decoSummary}>
                    <MaterialIcons name="warning" size={14} color="#BA7517" />
                    <Text style={styles.decoSummaryTxt}>
                        {decoStops.length} palier{decoStops.length > 1 ? 's' : ''} · {totalDecoTime.toFixed(0)} min de déco
                    </Text>
                </View>
            ) : (
                <View style={styles.ndlBanner}>
                    <MaterialIcons name="check-circle" size={14} color={ocean.accent.teal} />
                    <Text style={styles.ndlTxt}>Sans palier obligatoire</Text>
                </View>
            )}

            {/* Tableau */}
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.table}>

                    {/* En-tête */}
                    <View style={styles.header}>
                        <Text style={[styles.hCell, styles.colPhase]}>Phase</Text>
                        <Text style={[styles.hCell, styles.colDepth]}>Prof.</Text>
                        <Text style={[styles.hCell, styles.colTime]}>Durée</Text>
                        <Text style={[styles.hCell, styles.colRuntime]}>Runtime</Text>
                        <Text style={[styles.hCell, styles.colGas]}>Gaz</Text>
                    </View>

                    {/* Lignes */}
                    {rows.map(({ seg, kind, runtime }, i) => {
                        const meta = KIND_META[kind];
                        return (
                            <View
                                key={i}
                                style={[styles.row, { backgroundColor: meta.bg }]}
                            >
                                {/* Indicateur de phase */}
                                <View style={[styles.dCell, styles.colPhase, styles.phaseCell]}>
                                    <View style={[styles.phaseBar, { backgroundColor: meta.color }]} />
                                    <Text style={[styles.phaseTxt, { color: meta.color }]}>
                                        {meta.label}
                                    </Text>
                                </View>

                                {/* Profondeur */}
                                <View style={[styles.dCell, styles.colDepth]}>
                                    {seg.startDepth === seg.endDepth ? (
                                        <Text style={styles.cellTxt}>{seg.startDepth} m</Text>
                                    ) : (
                                        <Text style={styles.cellTxt}>
                                            {seg.startDepth}→{seg.endDepth} m
                                        </Text>
                                    )}
                                </View>

                                {/* Durée */}
                                <View style={[styles.dCell, styles.colTime]}>
                                    <Text style={styles.cellTxt}>{seg.time.toFixed(0)} min</Text>
                                </View>

                                {/* Runtime cumulatif */}
                                <View style={[styles.dCell, styles.colRuntime]}>
                                    <Text style={[styles.cellTxt, styles.runtimeTxt]}>
                                        {runtime.toFixed(0)}'
                                    </Text>
                                </View>

                                {/* Gaz */}
                                <View style={[styles.dCell, styles.colGas]}>
                                    <Text style={styles.gasTxt} numberOfLines={1}>{seg.gasName}</Text>
                                </View>

                            </View>
                        );
                    })}

                </View>
            </ScrollView>

            {/* Avertissement */}
            <View style={styles.warning}>
                <MaterialIcons name="info-outline" size={12} color={ocean.text.muted} />
                <Text style={styles.warningTxt}>
                    Calcul indicatif uniquement — non qualifié pour la plongée réelle.
                </Text>
            </View>

        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, gap: spacing.xs },

    // Résumé
    decoSummary: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        backgroundColor: 'rgba(186,117,23,0.1)',
        borderRadius: radius.sm, borderWidth: 0.5, borderColor: '#BA7517',
        paddingHorizontal: spacing.sm, paddingVertical: 5,
    },
    decoSummaryTxt: { fontSize: fontSize.xs, color: '#BA7517' },
    ndlBanner: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        backgroundColor: 'rgba(29,158,117,0.1)',
        borderRadius: radius.sm, borderWidth: 0.5, borderColor: ocean.accent.teal,
        paddingHorizontal: spacing.sm, paddingVertical: 5,
    },
    ndlTxt: { fontSize: fontSize.xs, color: ocean.accent.teal },

    // Tableau
    scroll: { flex: 1 },
    table: {
        borderRadius: radius.md, overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth, borderColor: ocean.border.subtle,
    },

    header: {
        flexDirection: 'row',
        backgroundColor: ocean.bg.raised,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ocean.border.subtle,
        paddingVertical: 6,
    },
    hCell: {
        fontSize: 9, fontWeight: '600',
        color: ocean.text.muted,
        textTransform: 'uppercase', letterSpacing: 0.5,
        textAlign: 'center',
    },

    row: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: ocean.border.subtle,
    },
    dCell: {
        justifyContent: 'center', alignItems: 'center',
        paddingVertical: 7,
    },
    cellTxt: { fontSize: fontSize.xs, color: ocean.text.primary, textAlign: 'center' },
    runtimeTxt: { fontWeight: '500', color: ocean.text.secondary },
    gasTxt: { fontSize: fontSize.xs, color: ocean.accent.blue, textAlign: 'center' },

    phaseCell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 6, gap: 5 },
    phaseBar: { width: 2.5, height: 16, borderRadius: 2 },
    phaseTxt: { fontSize: 10, fontWeight: '500' },

    // Largeurs colonnes
    colPhase: { flex: 2.2 },
    colDepth: { flex: 2 },
    colTime: { flex: 1.4 },
    colRuntime: { flex: 1.4 },
    colGas: { flex: 1.8 },

    // Avertissement
    warning: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        paddingTop: 4,
    },
    warningTxt: { fontSize: 9, color: ocean.text.muted, flex: 1 },
});