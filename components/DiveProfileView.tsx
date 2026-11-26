// components/DiveProfileView.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Svg, {
  Circle, Defs, Line, LinearGradient,
  Path, Polyline, Rect, Stop, Text as SvgText,
} from 'react-native-svg';

import ProfileGrid from './charts/ProfileGrid';
import { PT, depthAxisMax, profileScale, timeTicks } from './charts/profileFrame';
import type { DivePlan, MN90Profile, PedagogicalSimulation, ProfileSegment } from '../lib/dive/types';

/** Courbes sélectionnables par la légende. */
type CurveId = 'A' | 'B' | 'MN90' | 'DCIEM';

export interface DiveProfileViewProps {
  plan: DivePlan;
  simulation: PedagogicalSimulation;
  currentStep: number;
  mn90Profile?: MN90Profile;
  /** Profil « modèle DCIEM calculé » (même format que MN90), tracé en violet. */
  dciemProfile?: MN90Profile;
  /** Vitesse de remontée fond→1er palier (m/min), pour tracer la remontée du profil MN90. Défaut : 10. */
  ascentRateMMin?: number;
  /** Vitesse de remontée entre paliers et jusqu'à la surface (m/min). Défaut : 6. */
  ascentRateBetweenStopsMMin?: number;
  label?: string;
  style?: ViewStyle;
  // ── Comparaison : overlay du 2e profil sur le même SVG ────────────────────
  comparisonPlan?: DivePlan;
  comparisonSimulation?: PedagogicalSimulation;
  comparisonLabel?: string;
}


export function DiveProfileView({
  plan, simulation, currentStep,
  mn90Profile, dciemProfile, ascentRateMMin = 10, ascentRateBetweenStopsMMin = 6, label, style,
  comparisonPlan, comparisonSimulation, comparisonLabel,
}: DiveProfileViewProps) {

  const [svgW, setSvgW] = useState(300);
  // Courbe mise en évidence en touchant sa légende (null = aucune : tout est normal).
  const [highlight, setHighlight] = useState<CurveId | null>(null);
  const toggleHighlight = (id: CurveId) => setHighlight(h => (h === id ? null : id));
  /** Opacité d'une courbe : atténuée si une autre est mise en évidence. */
  const dim = (id: CurveId) => (highlight && highlight !== id ? 0.25 : 1);
  /** Épaisseur : plus épaisse pour la courbe mise en évidence. */
  const thick = (id: CurveId, base: number) => (highlight === id ? base + 1.5 : base);
  const svgH = 300;

  const hasComparison = !!comparisonPlan && !!comparisonSimulation;

  // Profondeur max sur les deux plans
  const maxDepthA = Math.max(...plan.segments.map(s => Math.max(s.startDepthM, s.endDepthM)), 10);
  const maxDepthB = hasComparison
    ? Math.max(...comparisonPlan!.segments.map(s => Math.max(s.startDepthM, s.endDepthM)), 10)
    : 0;
  const maxDepth = Math.max(maxDepthA, maxDepthB);

  // MN90 — points en unités réelles (temps/profondeur), calculés avant
  // totalTime car le profil MN90 peut durer plus longtemps que le plan
  // simulé (vitesses de remontée plus lentes) et doit pouvoir étendre l'axe.
  const mn90BottomTime = mn90Profile
    ? (simulation.frames.find(f => f.depthM >= mn90Profile.maxDepthM)?.timeMin ?? 2)
    : 0;
  const mn90Segments = mn90Profile
    ? buildMN90Segments(mn90Profile, mn90BottomTime, ascentRateMMin, ascentRateBetweenStopsMMin)
    : null;
  const mn90EndTime = mn90Segments ? mn90Segments[mn90Segments.length - 1].time : 0;
  const dciemSegments = dciemProfile
    ? buildMN90Segments(dciemProfile, mn90BottomTimeFor(dciemProfile, simulation), ascentRateMMin, ascentRateBetweenStopsMMin)
    : null;
  const dciemEndTime = dciemSegments ? dciemSegments[dciemSegments.length - 1].time : 0;

  // L'axe temps couvre le plan A, le plan B (comparaison) et le profil MN90
  // — le plus long des trois, pour ne jamais couper la fin d'un tracé.
  const totalTime = Math.max(
    simulation.totalTimeMin,
    hasComparison ? comparisonSimulation!.totalTimeMin : 0,
    mn90EndTime,
    dciemEndTime,
  );
  // Échelle commune à tous les graphiques de profil (axe arrondi au 10 m supérieur)
  const scale = profileScale(svgW, svgH, totalTime, depthAxisMax(maxDepth));
  const { ph, tx, ty } = scale;

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
  const stopSegsA = mergeConsecutiveStops(
    plan.segments.filter(s => s.startDepthM === s.endDepthM && s.startDepthM > 0),
  );

  // Curseur animé (plan A)
  const frameA = simulation.frames[currentStep];
  const cursorX = tx(frameA?.timeMin ?? 0);
  const cursorY = ty(frameA?.depthM ?? 0);

  // MN90 — mappage des points réels (temps/profondeur) vers l'écran
  const mn90Points = mn90Segments
    ? mn90Segments.map((p: Mn90Point) => `${tx(p.time)},${ty(p.depth)}`).join(' ')
    : null;
  const dciemPoints = dciemSegments
    ? dciemSegments.map((p: Mn90Point) => `${tx(p.time)},${ty(p.depth)}`).join(' ')
    : null;

  const legendItems: { id: CurveId; color: string; text: string }[] = [];
  if (hasComparison) {
    legendItems.push({ id: 'A', color: '#378ADD', text: `${label ?? 'Plan A'} · ${Math.round(simulation.totalTimeMin)} min` });
    legendItems.push({ id: 'B', color: '#1D9E75', text: `${comparisonLabel ?? 'Plan B'} · ${Math.round(comparisonSimulation!.totalTimeMin)} min` });
  } else if (mn90Profile || dciemProfile) {
    legendItems.push({ id: 'A', color: '#378ADD', text: `Bühlmann · ${Math.round(simulation.totalTimeMin)} min` });
  }
  if (mn90Profile) legendItems.push({ id: 'MN90', color: '#EF9F27', text: `MN90 · ${Math.round(mn90EndTime)} min` });
  if (dciemProfile) legendItems.push({ id: 'DCIEM', color: '#A78BFA', text: `DCIEM (modèle calculé) · ${Math.round(dciemEndTime)} min` });

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

        <ProfileGrid
          scale={scale}
          height={svgH}
          timeTicks={timeTicks(totalTime).map(t => ({ atMin: t, label: `${t}'` }))}
        />

        {/* ── Plan A : remplissage + courbe ───────────────────────────── */}
        <Path d={fillPathA} fill="url(#fillA)" opacity={dim('A')} />
        <Polyline points={polylineA} fill="none"
          stroke="#378ADD" strokeWidth={thick('A', hasComparison ? 1.5 : 1.8)}
          opacity={dim('A')} strokeLinejoin="round" />

        {/* ── Plan B : courbe en overlay (teal pointillé) ──────────────── */}
        {polylineB && (
          <Polyline points={polylineB} fill="none"
            stroke="#1D9E75" strokeWidth={thick('B', 3)} opacity={dim('B')}
            strokeDasharray="5,3" strokeLinejoin="round" />
        )}

        {/* MN90 */}
        {mn90Points && (
          <Polyline points={mn90Points} fill="none"
            stroke="#EF9F27" strokeWidth={thick('MN90', 1.4)} opacity={dim('MN90')}
            strokeDasharray="4,3" strokeLinejoin="round" />
        )}

        {/* DCIEM (modèle calculé) */}
        {dciemPoints && (
          <Polyline points={dciemPoints} fill="none"
            stroke="#A78BFA" strokeWidth={thick('DCIEM', 1.4)} opacity={dim('DCIEM')}
            strokeDasharray="2,3" strokeLinejoin="round" />
        )}

        {/* Paliers MN90 / DCIEM : profondeur·durée, sous la ligne */}
        {mn90Segments && stopLabels(mn90Segments, mn90Profile!.maxDepthM).map((l, i) => (
          <SvgText key={`m9${i}`} x={tx(l.time)} y={ty(l.depth) + 10}
            textAnchor="middle" fontSize={8} fill="#EF9F27" opacity={dim('MN90')}>{l.text}</SvgText>
        ))}
        {dciemSegments && stopLabels(dciemSegments, dciemProfile!.maxDepthM).map((l, i) => (
          <SvgText key={`dc${i}`} x={tx(l.time)} y={ty(l.depth) + 19}
            textAnchor="middle" fontSize={8} fill="#A78BFA" opacity={dim('DCIEM')}>{l.text}</SvgText>
        ))}

        {/* Labels paliers plan A */}
        {stopSegsA.map((seg, i) => (
          <SvgText key={`sl${i}`}
            x={tx((seg.startTimeMin + seg.endTimeMin) / 2)} y={ty(seg.startDepthM) - 5}
            textAnchor="middle" fontSize={8} fill="#BA7517" opacity={dim('A')}>
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

      {/* Légende : toucher un libellé met la courbe en évidence (re-toucher pour annuler) */}
      <View style={styles.legendRow}>
        {legendItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.legendItem}
            onPress={() => toggleHighlight(item.id)} activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
            <View style={[styles.legendLine, {
              backgroundColor: item.color, height: highlight === item.id ? 3 : 2,
            }]} />
            <Text style={[styles.legendTxt, highlight === item.id && styles.legendTxtOn]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Regroupe les paliers consécutifs à la même profondeur (le calcul les découpe
 * en pas de 1 min) pour afficher « 6m·3' » au lieu de trois fois « 6m·1' ».
 */
function mergeConsecutiveStops(stops: ProfileSegment[]): ProfileSegment[] {
  const TOLERANCE_MIN = 1e-3;
  const merged: ProfileSegment[] = [];
  for (const stop of stops) {
    const last = merged[merged.length - 1];
    if (
      last
      && last.endDepthM === stop.startDepthM
      && last.gasId === stop.gasId
      && last.setpointBar === stop.setpointBar
      && Math.abs(last.endTimeMin - stop.startTimeMin) < TOLERANCE_MIN
    ) {
      merged[merged.length - 1] = { ...last, endTimeMin: stop.endTimeMin };
    } else {
      merged.push(stop);
    }
  }
  return merged;
}

/** Instant d'arrivée au fond (fin de descente) lu sur la simulation du plan. */
function mn90BottomTimeFor(profile: MN90Profile, simulation: PedagogicalSimulation): number {
  return simulation.frames.find(f => f.depthM >= profile.maxDepthM)?.timeMin ?? 2;
}

/** Étiquette « profondeur·durée » placée au milieu de chaque palier d'un profil MN90/DCIEM. */
function stopLabels(
  points: { time: number; depth: number }[],
  maxDepthM: number,
): { time: number; depth: number; text: string }[] {
  const labels: { time: number; depth: number; text: string }[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a.depth === b.depth && a.depth > 0 && a.depth < maxDepthM && b.time > a.time) {
      labels.push({ time: (a.time + b.time) / 2, depth: a.depth, text: `${a.depth}m·${Math.round(b.time - a.time)}'` });
    }
  }
  return labels;
}

/** Un point du profil MN90 en unités réelles (minutes, mètres) — non mappé à l'écran. */
interface Mn90Point {
  time: number;
  depth: number;
}

function buildMN90Segments(
  mn90: MN90Profile,
  bottomTime: number,
  ascentRateMMin: number,
  ascentRateBetweenStopsMMin: number,
): Mn90Point[] {
  const points: Mn90Point[] = [];
  points.push({ time: 0, depth: 0 });
  points.push({ time: bottomTime, depth: mn90.maxDepthM });

  // mn90.bottomTimeMin est le "temps de plongée" MN90 (issu de la table),
  // DESCENTE COMPRISE (convention MN90) — le palier de fond dure donc
  // jusqu'à mn90.bottomTimeMin, pas bottomTime + mn90.bottomTimeMin (ce qui
  // compterait la descente deux fois).
  let t = mn90.bottomTimeMin;
  points.push({ time: t, depth: mn90.maxDepthM });

  // Remontée : fond → 1er palier à ascentRateMMin, puis entre paliers et
  // jusqu'à la surface à ascentRateBetweenStopsMMin (plus lente) — plus de
  // saut instantané, chaque changement de profondeur prend le temps réel.
  let currentDepth = mn90.maxDepthM;
  let isFirstLeg = true;
  for (const stop of mn90.stops) {
    const rate = isFirstLeg ? ascentRateMMin : ascentRateBetweenStopsMMin;
    t += (currentDepth - stop.depthM) / rate;
    points.push({ time: t, depth: stop.depthM });
    t += stop.durationMin;
    points.push({ time: t, depth: stop.depthM });
    currentDepth = stop.depthM;
    isFirstLeg = false;
  }
  const finalRate = isFirstLeg ? ascentRateMMin : ascentRateBetweenStopsMMin;
  t += currentDepth / finalRate;
  points.push({ time: t, depth: 0 });

  return points;
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
  legendTxt: { fontSize: 9, color: '#5F5E5A' },
  legendTxtOn: { color: '#E8ECF4', fontWeight: '600' },
});