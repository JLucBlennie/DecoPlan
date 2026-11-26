// components/WhatIfProfileChart.tsx
// Un seul graphique : le profil nominal et ceux de tous les scénarios « Et si ? » superposés.
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Polyline, Stop } from 'react-native-svg';

import { endTimeMin, maxDepthM, type WhatIfKind, type WhatIfResult } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import { flatLevels } from './charts/flatLevels';
import { profileScale, PT, timeTicks } from './charts/profileFrame';
import ProfileGrid from './charts/ProfileGrid';
import ProfileLevelZones from './charts/ProfileLevelZones';
import { fillPathOf, polylineOf } from './charts/profilePaths';
import ProfilePlot from './charts/ProfilePlot';
import { buildWhatIfSeries } from './whatIfChartSeries';

const HEIGHT = 400;
/** À partir de cette largeur d'écran, la légende passe à droite du graphique (sinon dessous). */
const LEGEND_RIGHT_BREAKPOINT = 560;

type Props = {
    result: WhatIfResult;
    /** Runtime mis en évidence (fond, zones et étiquettes des paliers) ; nominal par défaut. */
    selectedKind?: WhatIfKind;
    /** Rend la légende cliquable. */
    onSelect?: (kind: WhatIfKind) => void;
};

export default function WhatIfProfileChart({ result, selectedKind = 'NOMINAL', onSelect }: Props) {
    const { width: screenWidth } = useWindowDimensions();
    const legendRight = screenWidth >= LEGEND_RIGHT_BREAKPOINT;

    const series = buildWhatIfSeries(result);
    const maxTime = Math.max(1, ...series.map(s => endTimeMin(s.points)));
    const maxDepth = Math.max(10, ...series.map(s => maxDepthM(s.points)));
    const selected = series.find(s => s.kind === selectedKind) ?? series.find(s => s.isReference);
    // La sélection est tracée en dernier, donc au-dessus des autres profils.
    const drawOrder = selected ? [...series.filter(s => s !== selected), selected] : series;

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Profils superposés</Text>

            <View style={legendRight ? styles.rowLayout : undefined}>
                <ProfilePlot height={HEIGHT} style={legendRight ? styles.plotFill : undefined}>
                    {width => {
                        const scale = profileScale(width, HEIGHT, maxTime, maxDepth);
                        return (
                            <Svg width={width} height={HEIGHT}>
                                <Defs>
                                    <LinearGradient id="fillSelected" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={selected?.color ?? '#378ADD'} stopOpacity="0.2" />
                                        <Stop offset="1" stopColor={selected?.color ?? '#378ADD'} stopOpacity="0.02" />
                                    </LinearGradient>
                                </Defs>
                                {selected && <ProfileLevelZones scale={scale} levels={flatLevels(selected.points)} />}
                                <ProfileGrid
                                    scale={scale}
                                    height={HEIGHT}
                                    timeTicks={[0, ...timeTicks(maxTime)].map(t => ({ atMin: t, label: `${t}'` }))}
                                />
                                {selected && <Path d={fillPathOf(selected.points, scale)} fill="url(#fillSelected)" />}
                                {drawOrder.map(s => (
                                    <Polyline
                                        key={s.kind}
                                        points={polylineOf(s.points, scale)}
                                        fill="none"
                                        stroke={s.color}
                                        strokeWidth={s === selected ? 2.6 : 1.2}
                                        strokeOpacity={s === selected ? 1 : 0.75}
                                        strokeLinejoin="round"
                                    />
                                ))}
                            </Svg>
                        );
                    }}
                </ProfilePlot>
                <View style={[styles.legend, legendRight ? styles.legendRight : styles.legendBelow]}>
                    {[...series].reverse().map(s => (
                        <Pressable
                            key={s.kind}
                            style={styles.legendItem}
                            onPress={onSelect ? () => onSelect(s.kind) : undefined}
                            disabled={!onSelect}
                            accessibilityRole="button"
                            accessibilityState={{ selected: s === selected }}
                        >
                            <View style={[styles.legendLine, { backgroundColor: s.color, height: s === selected ? 3 : 2 }]} />
                            <Text style={[styles.legendTxt, s === selected && styles.legendTxtOn]}>{s.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        alignSelf: 'stretch', backgroundColor: ocean.bg.surface, borderRadius: radius.md,
        borderWidth: 0.5, borderColor: ocean.border.subtle, padding: spacing.md,
        marginBottom: spacing.md,
    },
    title: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary, marginBottom: spacing.xs },
    rowLayout: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    plotFill: { flex: 1 },
    legend: { gap: spacing.xs },
    legendRight: { width: 130, paddingTop: PT },
    legendBelow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendLine: { width: 14, borderRadius: 1 },
    legendTxt: { fontSize: 10, color: ocean.text.muted, flexShrink: 1 },
    legendTxtOn: { color: ocean.text.primary, fontWeight: '600' },
});
