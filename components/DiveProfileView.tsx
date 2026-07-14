// components/DiveProfileView.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, {
  Circle, Defs, Line, LinearGradient,
  Path, Polyline, Rect, Stop, Text as SvgText,
} from 'react-native-svg';

import type { DivePlan, MN90Profile, PedagogicalSimulation } from '../lib/dive/types';

export interface DiveProfileViewProps {
  plan: DivePlan;
  simulation: PedagogicalSimulation;
  currentStep: number;
  mn90Profile?: MN90Profile;
  label?: string;
  style?: ViewStyle;
  // ── Comparaison : overlay du 2e profil sur le même SVG ────────────────────
  comparisonPlan?: DivePlan;
  comparisonSimulation?: PedagogicalSimulation;
  comparisonLabel?: string;
}

const PL = 38, PR = 8, PT = 10, PB = 28;

export function DiveProfileView({
  plan, simulation, currentStep,
  mn90Profile, label, style,
  comparisonPlan, comparisonSimulation, comparisonLabel,
}: DiveProfileViewProps) {

  const [svgW, setSvgW] = useState(300);
  const svgH = 300;
  const pw = svgW - PL - PR;
  const ph = svgH - PT - PB;

  const hasComparison = !!comparisonPlan && !!comparisonSimulation;

  // Profondeur max sur les deux plans
  const maxDepthA = Math.max(...plan.segments.map(s => Math.max(s.startDepthM, s.endDepthM)), 10);
  const maxDepthB = hasComparison
    ? Math.max(...comparisonPlan!.segments.map(s => Math.max(s.startDepthM, s.endDepthM)), 10)
    : 0;
  const maxDepth = Math.max(maxDepthA, maxDepthB);
  // Arrondi au 10m supérieur pour un axe propre
  const axisMax = Math.ceil(maxDepth / 10) * 10;

  const totalTime = Math.max(simulation.totalTimeMin, hasComparison ? comparisonSimulation!.totalTimeMin : 0);
  const tx = (t: number) => PL + (t / totalTime) * pw;
  const ty = (d: number) => PT + (d / axisMax) * ph;

  // ── Points des profils ────────────────────────────────────────────────────
  const buildPolyline = (p: DivePlan) =>
    p.segments.flatMap((seg, i) =>
      i === 0
        ? [`${tx(seg.startTimeMin).toFixed(1)},${ty(seg.startDepthM).toFixed(1)}`,
        `${tx(seg.endTimeMin).toFixed(1)},${ty(seg.endDepthM).toFixed(1)}`]
        : [`${tx(seg.endTimeMin).toFixed(1)},${ty(seg.endDepthM).toFixed(1)}`]
    ).join(' ');

  const buildFillPath = (p: DivePlan) => {
    const segs = p.segments;
    return [
      `M ${tx(segs[0].startTimeMin).toFixed(1)} ${ty(segs[0].startDepthM).toFixed(1)}`,
      ...segs.map(s => `L ${tx(s.endTimeMin).toFixed(1)} ${ty(s.endDepthM).toFixed(1)}`),
      `L ${tx(totalTime).toFixed(1)} ${ty(0).toFixed(1)}`,
      `L ${tx(segs[0].startTimeMin).toFixed(1)} ${ty(0).toFixed(1)} Z`,
    ].join(' ');
  };

  const polylineA = buildPolyline(plan);
  const fillPathA = buildFillPath(plan);
  const polylineB = hasComparison ? buildPolyline(comparisonPlan!) : null;

  // Zones de paliers (plan A uniquement pour éviter le bruit visuel)
  const stopSegsA = plan.segments.filter(s => s.startDepthM === s.endDepthM && s.startDepthM > 0);

  // Curseur animé (plan A)
  const frameA = simulation.frames[currentStep];
  const cursorX = tx(frameA?.timeMin ?? 0);
  const cursorY = ty(frameA?.depthM ?? 0);

  // MN90
  const mn90Points = mn90Profile
    ? buildMN90Polyline(mn90Profile, totalTime, tx, ty, simulation)
    : null;

  // Grilles
  const depthTicks = Array.from({ length: axisMax / 10 + 1 }, (_, i) => i * 10);
  const timeTicks = buildTimeTicks(totalTime);

  return (
    <View style={[styles.card, style]} onLayout={e => setSvgW(e.nativeEvent.layout.width - 20)}>
      {/* En-tête */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Profil de plongée</Text>
        {label && <Text style={styles.labelA}>{label}</Text>}
        {hasComparison && comparisonLabel && (
          <Text style={styles.labelB}>{comparisonLabel}</Text>
        )}
      </View>

      <Svg width={svgW} height={svgH}>
        <Defs>
          <LinearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#185FA5" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#185FA5" stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Zones de palier */}
        {stopSegsA.map((seg, i) => (
          <Rect key={i}
            x={tx(seg.startTimeMin)} y={ty(seg.startDepthM)}
            width={tx(seg.endTimeMin) - tx(seg.startTimeMin)}
            height={ph - (ty(seg.startDepthM) - PT)}
            fill="rgba(250,199,117,0.10)"
          />
        ))}

        {/* Grille profondeur */}
        {depthTicks.map(d => (
          <React.Fragment key={`dg${d}`}>
            <Line x1={PL} y1={ty(d)} x2={PL + pw} y2={ty(d)}
              stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />
            <SvgText x={PL - 4} y={ty(d) + 3.5}
              textAnchor="end" fontSize={9} fill="#5F5E5A">{d}m</SvgText>
          </React.Fragment>
        ))}

        {/* Grille temps */}
        {timeTicks.map(t => (
          <React.Fragment key={`tg${t}`}>
            <Line x1={tx(t)} y1={PT} x2={tx(t)} y2={PT + ph}
              stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
            <SvgText x={tx(t)} y={svgH - 6}
              textAnchor="middle" fontSize={9} fill="#5F5E5A">{t}'</SvgText>
          </React.Fragment>
        ))}

        {/* Surface */}
        <Line x1={PL} y1={ty(0)} x2={PL + pw} y2={ty(0)}
          stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />

        {/* ── Plan A : remplissage + courbe ───────────────────────────── */}
        <Path d={fillPathA} fill="url(#fillA)" />
        <Polyline points={polylineA} fill="none"
          stroke="#378ADD" strokeWidth={hasComparison ? 1.5 : 1.8}
          strokeLinejoin="round" />

        {/* ── Plan B : courbe en overlay (teal pointillé) ──────────────── */}
        {polylineB && (
          <Polyline points={polylineB} fill="none"
            stroke="#1D9E75" strokeWidth={3}
            strokeDasharray="5,3" strokeLinejoin="round" />
        )}

        {/* MN90 */}
        {mn90Points && (
          <Polyline points={mn90Points} fill="none"
            stroke="#EF9F27" strokeWidth={1.4}
            strokeDasharray="4,3" strokeLinejoin="round" />
        )}

        {/* Labels paliers plan A */}
        {stopSegsA.map((seg, i) => (
          <SvgText key={`sl${i}`}
            x={tx((seg.startTimeMin + seg.endTimeMin) / 2)} y={ty(seg.startDepthM) - 5}
            textAnchor="middle" fontSize={8} fill="#BA7517">
            {seg.startDepthM}m·{Math.round(seg.endTimeMin - seg.startTimeMin)}'
          </SvgText>
        ))}

        {/* Curseur animé */}
        <Line x1={cursorX} y1={PT} x2={cursorX} y2={PT + ph}
          stroke="#D85A30" strokeWidth={1} strokeDasharray="3,3" />
        <Circle cx={cursorX} cy={cursorY} r={4.5} fill="#D85A30" />
        <Circle cx={cursorX} cy={cursorY} r={4.5} fill="none"
          stroke="#0A0F1E" strokeWidth={1.5} />
      </Svg>

      {/* Légende */}
      <View style={styles.legendRow}>
        {hasComparison && (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: '#378ADD' }]} />
              <Text style={styles.legendTxt}>{label ?? 'Plan A'}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: '#1D9E75', borderStyle: 'dashed' }]} />
              <Text style={styles.legendTxt}>{comparisonLabel ?? 'Plan B'}</Text>
            </View>
          </>
        )}
        {mn90Profile && (
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#EF9F27' }]} />
            <Text style={styles.legendTxt}>MN90</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildTimeTicks(totalTime: number): number[] {
  const step = totalTime <= 20 ? 5 : totalTime <= 60 ? 10 : 15;
  const ticks: number[] = [];
  for (let t = step; t < totalTime; t += step) ticks.push(t);
  return ticks;
}

function buildMN90Polyline(
  mn90: MN90Profile, totalTime: number,
  tx: (t: number) => number, ty: (d: number) => number,
  sim: PedagogicalSimulation,
): string {
  const points: string[] = [];
  const bottomTime = sim.frames.find(f => f.depthM >= mn90.maxDepthM)?.timeMin ?? 2;
  points.push(`${tx(0)},${ty(0)}`);
  points.push(`${tx(bottomTime)},${ty(mn90.maxDepthM)}`);
  points.push(`${tx(mn90.bottomTimeMin + bottomTime)},${ty(mn90.maxDepthM)}`);
  let t = mn90.bottomTimeMin + bottomTime;
  for (const stop of mn90.stops) {
    points.push(`${tx(t)},${ty(stop.depthM)}`);
    t += stop.durationMin;
    points.push(`${tx(t)},${ty(stop.depthM)}`);
  }
  points.push(`${tx(t)},${ty(0)}`);
  return points.join(' ');
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
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 10, fontWeight: '500', color: '#5F5E5A',
    textTransform: 'uppercase', letterSpacing: 0.6, flex: 1,
  },
  labelA: { fontSize: 9, color: '#85B7EB' },
  labelB: { fontSize: 9, color: '#1D9E75' },

  legendRow: {
    flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendLine: { width: 14, height: 2, borderRadius: 1 },
  legendTxt: { fontSize: 8, color: '#5F5E5A' },
});