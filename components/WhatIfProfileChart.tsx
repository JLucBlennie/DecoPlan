// components/WhatIfProfileChart.tsx
// Un seul graphique : le profil nominal et ceux de tous les scénarios « Et si ? » superposés.
import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';

import { endTimeMin, maxDepthM, type ProfilePoint, type WhatIfResult } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import { timeTicks } from './successive/successiveProfileLayout';
import { buildWhatIfSeries } from './whatIfChartSeries';

const PL = 38, PR = 8, PT = 10, PB = 26;
const HEIGHT = 200;
/** À partir de cette largeur d'écran, la légende passe à droite du graphique (sinon dessous). */
const LEGEND_RIGHT_BREAKPOINT = 560;
const MIN_WIDTH = 120;

type Props = { result: WhatIfResult };

export default function WhatIfProfileChart({ result }: Props) {
    const { width: screenWidth } = useWindowDimensions();
    const legendRight = screenWidth >= LEGEND_RIGHT_BREAKPOINT;
    const [width, setWidth] = useState(320);
    const pw = width - PL - PR;
    const ph = HEIGHT - PT - PB;

    const series = buildWhatIfSeries(result);
    const maxTime = Math.max(1, ...series.map(s => endTimeMin(s.points)));
    const maxDepth = Math.max(10, ...series.map(s => maxDepthM(s.points)));
    const axisMax = Math.ceil(maxDepth / 10) * 10;

    const tx = (v: number) => PL + (v / maxTime) * pw;
    const ty = (d: number) => PT + (d / axisMax) * ph;
    const polyline = (points: ProfilePoint[]) =>
        points.map(p => `${tx(p.timeMin).toFixed(1)},${ty(p.depthM).toFixed(1)}`).join(' ');

    const depthTicks = Array.from({ length: axisMax / 10 + 1 }, (_, i) => i * 10);

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Profils superposés</Text>

            <View style={legendRight ? styles.rowLayout : undefined}>
                {/* Largeur mesurée sur un conteneur indépendant du SVG (évite la boucle de mesure). */}
                <View style={[styles.plot, legendRight && styles.plotFill]} onLayout={e => setWidth(Math.max(MIN_WIDTH, Math.floor(e.nativeEvent.layout.width)))}>
                    <View style={StyleSheet.absoluteFill}>
                        <Svg width={width} height={HEIGHT}>
                            {depthTicks.map(d => (
                                <React.Fragment key={`d${d}`}>
                                    <Line x1={PL} y1={ty(d)} x2={PL + pw} y2={ty(d)} stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />
                                    <SvgText x={PL - 4} y={ty(d) + 3.5} textAnchor="end" fontSize={9} fill="#5F5E5A">{d}m</SvgText>
                                </React.Fragment>
                            ))}
                            <Line x1={PL} y1={ty(0)} x2={PL + pw} y2={ty(0)} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                            {[0, ...timeTicks(maxTime)].map(t => (
                                <React.Fragment key={`t${t}`}>
                                    <Line x1={tx(t)} y1={PT} x2={tx(t)} y2={PT + ph} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
                                    <SvgText x={tx(t)} y={HEIGHT - 4} textAnchor="middle" fontSize={9} fill="#5F5E5A">{t}'</SvgText>
                                </React.Fragment>
                            ))}
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
                    </View>
                </View>
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
    plot: { alignSelf: 'stretch', height: HEIGHT },
    plotFill: { flex: 1 },
    legend: { gap: spacing.xs },
    legendRight: { width: 130, paddingTop: PT },
    legendBelow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendLine: { width: 14, borderRadius: 1 },
    legendTxt: { fontSize: 10, color: ocean.text.muted, flexShrink: 1 },
});
