// components/WhatIfProfileChart.tsx
// Un seul graphique : le profil nominal et ceux de tous les scénarios « Et si ? » superposés.
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { endTimeMin, maxDepthM, type ProfilePoint, type WhatIfResult } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import ProfileGrid from './charts/ProfileGrid';
import ProfilePlot from './charts/ProfilePlot';
import { profileScale, PT, timeTicks } from './charts/profileFrame';
import { buildWhatIfSeries } from './whatIfChartSeries';

const HEIGHT = 200;
/** À partir de cette largeur d'écran, la légende passe à droite du graphique (sinon dessous). */
const LEGEND_RIGHT_BREAKPOINT = 560;

type Props = { result: WhatIfResult };

export default function WhatIfProfileChart({ result }: Props) {
    const { width: screenWidth } = useWindowDimensions();
    const legendRight = screenWidth >= LEGEND_RIGHT_BREAKPOINT;

    const series = buildWhatIfSeries(result);
    const maxTime = Math.max(1, ...series.map(s => endTimeMin(s.points)));
    const maxDepth = Math.max(10, ...series.map(s => maxDepthM(s.points)));

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Profils superposés</Text>

            <View style={legendRight ? styles.rowLayout : undefined}>
                <ProfilePlot height={HEIGHT} style={legendRight ? styles.plotFill : undefined}>
                    {width => {
                        const scale = profileScale(width, HEIGHT, maxTime, maxDepth);
                        const polyline = (points: ProfilePoint[]) =>
                            points.map(p => `${scale.tx(p.timeMin).toFixed(1)},${scale.ty(p.depthM).toFixed(1)}`).join(' ');
                        return (
                            <Svg width={width} height={HEIGHT}>
                                <ProfileGrid
                                    scale={scale}
                                    height={HEIGHT}
                                    timeTicks={[0, ...timeTicks(maxTime)].map(t => ({ atMin: t, label: `${t}'` }))}
                                />
                                {series.map(s => (
                                    <Polyline
                                        key={s.kind}
                                        points={polyline(s.points)}
                                        fill="none"
                                        stroke={s.color}
                                        strokeWidth={s.isReference ? 2.2 : 1.4}
                                        strokeLinejoin="round"
                                    />
                                ))}
                            </Svg>
                        );
                    }}
                </ProfilePlot>
                <View style={[styles.legend, legendRight ? styles.legendRight : styles.legendBelow]}>
                    {[...series].reverse().map(s => (
                        <View key={s.kind} style={styles.legendItem}>
                            <View style={[styles.legendLine, { backgroundColor: s.color, height: s.isReference ? 3 : 2 }]} />
                            <Text style={styles.legendTxt}>{s.label}</Text>
                        </View>
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
});
