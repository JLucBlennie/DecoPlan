// Profils des deux plongées bout à bout (Bühlmann), avec le profil MN90 en option.
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Polyline, Rect, Stop, Text as SvgText } from 'react-native-svg';

import {
  buhlmannPoints, dciemResultToProfile, endTimeMin, maxDepthM, mn90Points, stopLabelsOf,
  type ComputedDive, type DiveSettings, type ProfilePoint, type SuccessiveResult,
} from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import ProfileGrid from '../charts/ProfileGrid';
import ProfilePlot from '../charts/ProfilePlot';
import { profileScale, PT, timeTicks } from '../charts/profileFrame';
import { fillPathOf, polylineOf } from '../charts/profilePaths';
import { computeProfileLayout, shiftPoints } from './successiveProfileLayout';
import { formatInterval } from './successiveFormat';

const HEIGHT = 260;

/** Courbes sélectionnables par la légende. */
type CurveId = 'BUHLMANN' | 'MN90' | 'DCIEM';
const COLOR_BUHLMANN = '#378ADD';
const COLOR_MN90 = '#EF9F27';
const COLOR_DCIEM = '#A78BFA';

type Props = {
  result: SuccessiveResult;
  settings: DiveSettings;
  showMn90: boolean;
  onToggleMn90: () => void;
  showDciem: boolean;
  onToggleDciem: () => void;
};

/** Paliers de déco d'une plongée : segments à plat sous la profondeur de fond. */
function stopSegments(dive: ComputedDive) {
  const max = dive.summary.maxDepthM;
  let t = 0;
  const out: { startMin: number; endMin: number; depthM: number }[] = [];
  for (const s of dive.segments) {
    const start = t;
    t += s.time;
    if (s.startDepth === s.endDepth && s.startDepth > 0 && s.startDepth < max * 0.85) {
      out.push({ startMin: start, endMin: t, depthM: s.startDepth });
    }
  }
  return out;
}

export default function SuccessiveProfileChart({ result, settings, showMn90, onToggleMn90, showDciem, onToggleDciem }: Props) {
  const { first, second, mn90, dciem, surfaceIntervalMin } = result;
  const isConsecutive = mn90.relation === 'CONSECUTIVE';

  // Courbe mise en évidence en touchant sa légende (null = aucune : tout est normal).
  const [highlight, setHighlight] = useState<CurveId | null>(null);
  const toggleHighlight = (id: CurveId) => setHighlight(h => (h === id ? null : id));
  const dim = (id: CurveId) => (highlight && highlight !== id ? 0.25 : 1);
  const thick = (id: CurveId, base: number) => (highlight === id ? base + 1.5 : base);

  const buh1 = buhlmannPoints(first.segments);
  const buh2 = buhlmannPoints(second.segments);

  const toMn90 = (profile: typeof mn90.firstDive) =>
    profile
      ? mn90Points(profile, settings.descentRateMMin, settings.ascentRateMMin, settings.ascentRateBetweenStopsMMin)
      : null;
  // Consécutives : MN90 lit UNE plongée équivalente, tracée depuis la mise à l'eau.
  const mn90First = showMn90 ? toMn90(isConsecutive ? mn90.secondDive : mn90.firstDive) : null;
  const mn90Second = showMn90 && !isConsecutive ? toMn90(mn90.secondDive) : null;

  // DCIEM : modèle calculé, deux vraies plongées même pour des consécutives.
  const toDciem = (r: typeof dciem.first) =>
    mn90Points(dciemResultToProfile(r), settings.descentRateMMin, settings.ascentRateMMin, settings.ascentRateBetweenStopsMMin);
  const dciemFirst = showDciem ? toDciem(dciem.first) : null;
  const dciemSecond = showDciem ? toDciem(dciem.second) : null;

  const firstEnd = Math.max(endTimeMin(buh1), isConsecutive ? 0 : endTimeMin(mn90First ?? []), endTimeMin(dciemFirst ?? []));
  const secondEnd = Math.max(endTimeMin(buh2), endTimeMin(mn90Second ?? []), endTimeMin(dciemSecond ?? []));
  const layout = computeProfileLayout(firstEnd, secondEnd, isConsecutive ? endTimeMin(mn90First ?? []) : 0);

  const maxDepth = Math.max(10, maxDepthM(buh1), maxDepthM(buh2), maxDepthM(mn90First ?? []), maxDepthM(mn90Second ?? []),
    maxDepthM(dciemFirst ?? []), maxDepthM(dciemSecond ?? []));

  const dives = [
    { dive: first, points: shiftPoints(buh1, 0), offset: 0, len: layout.firstLenMin },
    { dive: second, points: shiftPoints(buh2, layout.secondStartMin), offset: layout.secondStartMin, len: layout.secondLenMin },
  ];

  // Légende : durée de chaque plongée (de la mise à l'eau à la sortie) ; toucher un libellé met la courbe en évidence.
  const minutes = (points: ProfilePoint[] | null) => `${Math.round(endTimeMin(points ?? []))}'`;
  const legendItems: { id: CurveId; color: string; text: string }[] = [
    { id: 'BUHLMANN', color: COLOR_BUHLMANN, text: `Bühlmann · ${minutes(buh1)} / ${minutes(buh2)}` },
  ];
  if (showMn90) {
    legendItems.push({
      id: 'MN90', color: COLOR_MN90,
      text: isConsecutive ? `MN90 · ${minutes(mn90First)} (plongée unique)` : `MN90 · ${minutes(mn90First)} / ${minutes(mn90Second)}`,
    });
  }
  if (showDciem) {
    legendItems.push({ id: 'DCIEM', color: COLOR_DCIEM, text: `DCIEM (modèle calculé) · ${minutes(dciemFirst)} / ${minutes(dciemSecond)}` });
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Profils des deux plongées</Text>
        <View style={styles.chips}>
          <TouchableOpacity style={[styles.chip, showMn90 && styles.chipActive]} onPress={onToggleMn90}>
            <Text style={[styles.chipTxt, showMn90 && styles.chipTxtActive]}>MN90</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, showDciem && styles.chipDciemActive]} onPress={onToggleDciem}>
            <Text style={[styles.chipTxt, showDciem && styles.chipTxtDciemActive]}>DCIEM</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ProfilePlot height={HEIGHT}>
        {width => {
          const scale = profileScale(width, HEIGHT, layout.totalLenMin, maxDepth);
          const { tx, ty, ph } = scale;
          return (
      <Svg width={width} height={HEIGHT}>
        <Defs>
          <LinearGradient id="fillDive" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#185FA5" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#185FA5" stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Coupure : intervalle surface (hors échelle) */}
        <Rect x={tx(layout.firstLenMin)} y={PT} width={tx(layout.secondStartMin) - tx(layout.firstLenMin)} height={ph}
          fill="rgba(255,255,255,0.04)" />
        <SvgText x={(tx(layout.firstLenMin) + tx(layout.secondStartMin)) / 2} y={ty(0) + 14}
          textAnchor="middle" fontSize={9} fill="#85B7EB">
          {formatInterval(surfaceIntervalMin)}
        </SvgText>

        <ProfileGrid
          scale={scale}
          height={HEIGHT}
          timeTicks={dives.flatMap(({ offset, len }) => timeTicks(len).map(t => ({ atMin: offset + t, label: `${t}'` })))}
        />

        {dives.map(({ dive, points, offset }, i) => (
          <React.Fragment key={i}>
            <Path d={fillPathOf(points, scale)} fill="url(#fillDive)" opacity={dim('BUHLMANN')} />
            <Polyline points={polylineOf(points, scale)} fill="none" stroke={COLOR_BUHLMANN} strokeWidth={thick('BUHLMANN', 1.8)}
              opacity={dim('BUHLMANN')} strokeLinejoin="round" />
            {stopSegments(dive).map((s, k) => (
              <SvgText key={k} x={tx(offset + (s.startMin + s.endMin) / 2)} y={ty(s.depthM) - 5}
                textAnchor="middle" fontSize={8} fill="#BA7517" opacity={dim('BUHLMANN')}>
                {s.depthM}m·{Math.round(s.endMin - s.startMin)}'
              </SvgText>
            ))}
            <SvgText x={tx(offset)} y={PT + 9} fontSize={9} fill="#85B7EB">{i === 0 ? 'Plongée 1' : 'Plongée 2'}</SvgText>
          </React.Fragment>
        ))}

        {mn90First && (
          <Polyline points={polylineOf(mn90First, scale)} fill="none" stroke={COLOR_MN90} strokeWidth={thick('MN90', 1.4)}
            opacity={dim('MN90')} strokeDasharray="4,3" strokeLinejoin="round" />
        )}
        {mn90Second && (
          <Polyline points={polylineOf(shiftPoints(mn90Second, layout.secondStartMin), scale)} fill="none" stroke={COLOR_MN90}
            strokeWidth={thick('MN90', 1.4)} opacity={dim('MN90')} strokeDasharray="4,3" strokeLinejoin="round" />
        )}
        {dciemFirst && (
          <Polyline points={polylineOf(dciemFirst, scale)} fill="none" stroke={COLOR_DCIEM} strokeWidth={thick('DCIEM', 1.4)}
            opacity={dim('DCIEM')} strokeDasharray="2,3" strokeLinejoin="round" />
        )}
        {dciemSecond && (
          <Polyline points={polylineOf(shiftPoints(dciemSecond, layout.secondStartMin), scale)} fill="none" stroke={COLOR_DCIEM}
            strokeWidth={thick('DCIEM', 1.4)} opacity={dim('DCIEM')} strokeDasharray="2,3" strokeLinejoin="round" />
        )}
        {/* Paliers MN90 / DCIEM : profondeur·durée, sous la ligne */}
        {[
          { id: 'MN90' as const, color: COLOR_MN90, dy: 10, sets: [[mn90First, 0], [mn90Second, layout.secondStartMin]] as const },
          { id: 'DCIEM' as const, color: COLOR_DCIEM, dy: 19, sets: [[dciemFirst, 0], [dciemSecond, layout.secondStartMin]] as const },
        ].flatMap(({ id, color, dy, sets }) => sets.flatMap(([points, offset], k) =>
          (points ? stopLabelsOf(points) : []).map((l, j) => (
            <SvgText key={`${id}${k}-${j}`} x={tx(offset + l.timeMin)} y={ty(l.depthM) + dy}
              textAnchor="middle" fontSize={8} fill={color} opacity={dim(id)}>{l.text}</SvgText>
          ))))}
      </Svg>
          );
        }}
      </ProfilePlot>

      <View style={styles.legend}>
        {legendItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.legendItem} onPress={() => toggleHighlight(item.id)}
            activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
            <View style={[styles.legendLine, { backgroundColor: item.color, height: highlight === item.id ? 3 : 2 }]} />
            <Text style={[styles.legendTxt, highlight === item.id && styles.legendTxtOn]}>{item.text}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.legendTxt}>Temps de chaque plongée depuis sa mise à l'eau ; l'intervalle n'est pas à l'échelle.</Text>
      </View>
      {showMn90 && isConsecutive && (
        <Text style={styles.legendTxt}>Consécutives : MN90 lit une seule plongée équivalente, tracée depuis la mise à l'eau.</Text>
      )}
      {showMn90 && !isConsecutive && !mn90.secondDive && (
        <Text style={styles.legendTxt}>Plongée 2 hors table MN90 : pas de tracé.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch', backgroundColor: ocean.bg.surface, borderRadius: radius.md,
    borderWidth: 0.5, borderColor: ocean.border.subtle, padding: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  title: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  chips: { flexDirection: 'row', gap: spacing.xs },
  chipDciemActive: { backgroundColor: 'rgba(167,139,250,0.18)', borderColor: COLOR_DCIEM },
  chipTxtDciemActive: { color: COLOR_DCIEM },
  chipActive: { backgroundColor: 'rgba(239,159,39,0.18)', borderColor: COLOR_MN90 },
  chipTxt: { fontSize: fontSize.xs, color: ocean.text.muted },
  chipTxtActive: { color: COLOR_MN90 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendLine: { width: 14, height: 2, borderRadius: 1 },
  legendTxt: { fontSize: 10, color: ocean.text.muted },
  legendTxtOn: { color: ocean.text.primary, fontWeight: '600' },
});
