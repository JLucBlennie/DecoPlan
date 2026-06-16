// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — DiveProfileView (react-native-svg)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path, Polyline,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import type { DivePlan, MN90Profile, PedagogicalSimulation } from '../lib/dive/types';

export interface DiveProfileViewProps {
  plan: DivePlan;
  simulation: PedagogicalSimulation;
  currentStep: number;
  mn90Profile?: MN90Profile;
  label?: string;
  style?: ViewStyle;
}

// Marges internes du graphique
const PL = 38, PR = 8, PT = 10, PB = 24;
const MAX_DEPTH_DISPLAY = 40; // axe Y en m

export function DiveProfileView({
  plan, simulation, currentStep, mn90Profile, label, style,
}: DiveProfileViewProps) {

  const [svgW, setSvgW] = useState(300);
  const svgH = 160;
  const pw = svgW - PL - PR;
  const ph = svgH - PT - PB;

  const totalTime = simulation.totalTimeMin;
  const tx = (t: number) => PL + (t / totalTime) * pw;
  const ty = (d: number) => PT + (d / MAX_DEPTH_DISPLAY) * ph;

  // Construction du polyline principal
  const profilePoints = plan.segments.flatMap((seg, i) =>
    i === 0
      ? [`${tx(seg.startTimeMin)},${ty(seg.startDepthM)}`, `${tx(seg.endTimeMin)},${ty(seg.endDepthM)}`]
      : [`${tx(seg.endTimeMin)},${ty(seg.endDepthM)}`]
  ).join(' ');

  // Zones de paliers (segments plats non-zéro)
  const stopSegments = plan.segments.filter(
    s => s.startDepthM === s.endDepthM && s.startDepthM > 0
  );

  // Curseur animé
  const frame = simulation.frames[currentStep];
  const cursorX = tx(frame?.timeMin ?? 0);
  const cursorY = ty(frame?.depthM ?? 0);

  // Profil MN90 (overlay pointillé)
  const mn90Points = mn90Profile
    ? buildMN90Polyline(mn90Profile, totalTime, tx, ty, simulation)
    : null;

  // Grille
  const depthTicks = [0, 10, 20, 30, 40].filter(d => d <= MAX_DEPTH_DISPLAY);
  const timeTicks  = buildTimeTicks(totalTime);

  return (
    <View
      style={[styles.card, style]}
      onLayout={e => setSvgW(e.nativeEvent.layout.width - 20)}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={styles.sectionTitle}>Profil de plongée</Text>

      <Svg width={svgW} height={svgH}>
        <Defs>
          <LinearGradient id="profileFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#185FA5" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#185FA5" stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Zones de palier */}
        {stopSegments.map((seg, i) => (
          <Rect
            key={i}
            x={tx(seg.startTimeMin)}
            y={ty(seg.startDepthM)}
            width={tx(seg.endTimeMin) - tx(seg.startTimeMin)}
            height={ph - (ty(seg.startDepthM) - PT)}
            fill="rgba(250,199,117,0.12)"
          />
        ))}

        {/* Grille horizontale */}
        {depthTicks.map(d => (
          <React.Fragment key={`dg-${d}`}>
            <Line
              x1={PL} y1={ty(d)} x2={PL + pw} y2={ty(d)}
              stroke="rgba(255,255,255,0.07)" strokeWidth={0.5}
            />
            <SvgText
              x={PL - 4} y={ty(d) + 3.5}
              textAnchor="end" fontSize={9} fill="#5F5E5A"
            >{d}m</SvgText>
          </React.Fragment>
        ))}

        {/* Grille verticale (temps) */}
        {timeTicks.map(t => (
          <React.Fragment key={`tg-${t}`}>
            <Line
              x1={tx(t)} y1={PT} x2={tx(t)} y2={PT + ph}
              stroke="rgba(255,255,255,0.05)" strokeWidth={0.5}
            />
            <SvgText
              x={tx(t)} y={svgH - 4}
              textAnchor="middle" fontSize={9} fill="#5F5E5A"
            >{t}'</SvgText>
          </React.Fragment>
        ))}

        {/* Surface */}
        <Line x1={PL} y1={ty(0)} x2={PL + pw} y2={ty(0)} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />

        {/* Remplissage sous la courbe */}
        <Path
          d={`M ${tx(plan.segments[0].startTimeMin)} ${ty(plan.segments[0].startDepthM)}
              ${plan.segments.map(s => `L ${tx(s.endTimeMin)} ${ty(s.endDepthM)}`).join(' ')}
              L ${tx(totalTime)} ${ty(0)} L ${tx(plan.segments[0].startTimeMin)} ${ty(0)} Z`}
          fill="url(#profileFill)"
        />

        {/* Courbe principale */}
        <Polyline
          points={profilePoints}
          fill="none"
          stroke="#378ADD"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />

        {/* Overlay MN90 */}
        {mn90Points && (
          <Polyline
            points={mn90Points}
            fill="none"
            stroke="#EF9F27"
            strokeWidth={1.4}
            strokeDasharray="4,3"
            strokeLinejoin="round"
          />
        )}

        {/* Labels paliers */}
        {stopSegments.map((seg, i) => {
          const midT = (seg.startTimeMin + seg.endTimeMin) / 2;
          return (
            <SvgText
              key={`sl-${i}`}
              x={tx(midT)} y={ty(seg.startDepthM) - 5}
              textAnchor="middle" fontSize={8} fill="#BA7517"
            >
              {seg.startDepthM}m · {Math.round(seg.endTimeMin - seg.startTimeMin)}min
            </SvgText>
          );
        })}

        {/* Curseur animé */}
        <Line
          x1={cursorX} y1={PT}
          x2={cursorX} y2={PT + ph}
          stroke="#D85A30" strokeWidth={1}
          strokeDasharray="3,3"
        />
        <Circle
          cx={cursorX} cy={cursorY}
          r={4.5} fill="#D85A30"
        />
        <Circle
          cx={cursorX} cy={cursorY}
          r={4.5} fill="none"
          stroke="#0A0F1E" strokeWidth={1.5}
        />
      </Svg>

      {/* Légende MN90 */}
      {mn90Profile && (
        <View style={styles.mn90legend}>
          <View style={styles.mn90line} />
          <Text style={styles.mn90txt}>Référence MN90</Text>
        </View>
      )}
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildTimeTicks(totalTimeMin: number): number[] {
  const step = totalTimeMin <= 20 ? 5 : totalTimeMin <= 60 ? 10 : 15;
  const ticks: number[] = [];
  for (let t = 0; t <= totalTimeMin; t += step) ticks.push(t);
  return ticks;
}

function buildMN90Polyline(
  mn90: MN90Profile,
  totalTime: number,
  tx: (t: number) => number,
  ty: (d: number) => number,
  sim: PedagogicalSimulation
): string {
  // On reconstruit le profil MN90 à partir des paliers
  // Hypothèse : même descente que le plan principal
  const points: string[] = [];

  // Descente identique (on récupère le temps au fond depuis la sim)
  const bottomTime = sim.frames.find(f => f.depthM >= mn90.maxDepthM)?.timeMin ?? 2;
  points.push(`${tx(0)},${ty(0)}`);
  points.push(`${tx(bottomTime)},${ty(mn90.maxDepthM)}`);
  points.push(`${tx(mn90.bottomTimeMin + bottomTime)},${ty(mn90.maxDepthM)}`);

  // Paliers MN90
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
    backgroundColor: '#0D1526',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '500', color: '#5F5E5A',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4,
  },
  label: {
    fontSize: 10, color: '#378ADD', marginBottom: 2,
  },
  mn90legend: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4,
  },
  mn90line: {
    width: 20, height: 1.5,
    backgroundColor: '#EF9F27',
    borderStyle: 'dashed',  // note : RN ne supporte pas dashed sur View, ok en déco
  },
  mn90txt: { fontSize: 9, color: '#854F0B' },
});
