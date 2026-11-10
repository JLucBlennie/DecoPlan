// Profils des deux plongées bout à bout (Bühlmann), avec le profil MN90 en option.
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Polyline, Rect, Stop, Text as SvgText } from 'react-native-svg';

import {
  buhlmannPoints, endTimeMin, maxDepthM, mn90Points,
  type ComputedDive, type DiveSettings, type ProfilePoint, type SuccessiveResult,
} from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import { computeProfileLayout, shiftPoints, timeTicks } from './successiveProfileLayout';
import { formatInterval } from './successiveFormat';

const PL = 38, PR = 8, PT = 10, PB = 26;
const HEIGHT = 260;
const MIN_WIDTH = 120;
const COLOR_BUHLMANN = '#378ADD';
const COLOR_MN90 = '#EF9F27';

type Props = {
  result: SuccessiveResult;
  settings: DiveSettings;
  showMn90: boolean;
  onToggleMn90: () => void;
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

export default function SuccessiveProfileChart({ result, settings, showMn90, onToggleMn90 }: Props) {
  const [width, setWidth] = useState(320);
  const pw = width - PL - PR;
  const ph = HEIGHT - PT - PB;

  const { first, second, mn90, surfaceIntervalMin } = result;
  const isConsecutive = mn90.relation === 'CONSECUTIVE';

  const buh1 = buhlmannPoints(first.segments);
  const buh2 = buhlmannPoints(second.segments);

  const toMn90 = (profile: typeof mn90.firstDive) =>
    profile
      ? mn90Points(profile, settings.descentRateMMin, settings.ascentRateMMin, settings.ascentRateBetweenStopsMMin)
      : null;
  // Consécutives : MN90 lit UNE plongée équivalente, tracée depuis la mise à l'eau.
  const mn90First = showMn90 ? toMn90(isConsecutive ? mn90.secondDive : mn90.firstDive) : null;
  const mn90Second = showMn90 && !isConsecutive ? toMn90(mn90.secondDive) : null;

  const firstEnd = Math.max(endTimeMin(buh1), isConsecutive ? 0 : endTimeMin(mn90First ?? []));
  const secondEnd = Math.max(endTimeMin(buh2), endTimeMin(mn90Second ?? []));
  const layout = computeProfileLayout(firstEnd, secondEnd, isConsecutive ? endTimeMin(mn90First ?? []) : 0);

  const maxDepth = Math.max(10, maxDepthM(buh1), maxDepthM(buh2), maxDepthM(mn90First ?? []), maxDepthM(mn90Second ?? []));
  const axisMax = Math.ceil(maxDepth / 10) * 10;
  const tx = (v: number) => PL + (v / layout.totalLenMin) * pw;
  const ty = (d: number) => PT + (d / axisMax) * ph;

  const polyline = (points: ProfilePoint[]) => points.map(p => `${tx(p.timeMin).toFixed(1)},${ty(p.depthM).toFixed(1)}`).join(' ');
  const fillPath = (points: ProfilePoint[]) => {
    const line = points.map(p => `L ${tx(p.timeMin).toFixed(1)} ${ty(p.depthM).toFixed(1)}`).join(' ');
    return `M ${tx(points[0].timeMin).toFixed(1)} ${ty(0).toFixed(1)} ${line} L ${tx(points[points.length - 1].timeMin).toFixed(1)} ${ty(0).toFixed(1)} Z`;
  };

  const dives = [
    { dive: first, points: shiftPoints(buh1, 0), offset: 0, len: layout.firstLenMin },
    { dive: second, points: shiftPoints(buh2, layout.secondStartMin), offset: layout.secondStartMin, len: layout.secondLenMin },
  ];
  const depthTicks = Array.from({ length: axisMax / 10 + 1 }, (_, i) => i * 10);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Profils des deux plongées</Text>
        <TouchableOpacity style={[styles.chip, showMn90 && styles.chipActive]} onPress={onToggleMn90}>
          <Text style={[styles.chipTxt, showMn90 && styles.chipTxtActive]}>MN90</Text>
        </TouchableOpacity>
      </View>

      {/* La largeur vient d'un conteneur dont la taille ne dépend PAS du SVG (sinon boucle de mesure :
          le SVG élargit la carte, qui élargit le SVG…). Le SVG est donc posé en absolu dedans. */}
      <View style={styles.plot} onLayout={e => setWidth(Math.max(MIN_WIDTH, Math.floor(e.nativeEvent.layout.width)))}>
        <View style={StyleSheet.absoluteFill}>
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

        {depthTicks.map(d => (
          <React.Fragment key={`d${d}`}>
            <Line x1={PL} y1={ty(d)} x2={PL + pw} y2={ty(d)} stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />
            <SvgText x={PL - 4} y={ty(d) + 3.5} textAnchor="end" fontSize={9} fill="#5F5E5A">{d}m</SvgText>
          </React.Fragment>
        ))}
        <Line x1={PL} y1={ty(0)} x2={PL + pw} y2={ty(0)} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />

        {dives.map(({ dive, points, offset, len }, i) => (
          <React.Fragment key={i}>
            {timeTicks(len).map(t => (
              <React.Fragment key={`t${i}-${t}`}>
                <Line x1={tx(offset + t)} y1={PT} x2={tx(offset + t)} y2={PT + ph} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
                <SvgText x={tx(offset + t)} y={HEIGHT - 4} textAnchor="middle" fontSize={9} fill="#5F5E5A">{t}'</SvgText>
              </React.Fragment>
            ))}
            <Path d={fillPath(points)} fill="url(#fillDive)" />
            <Polyline points={polyline(points)} fill="none" stroke={COLOR_BUHLMANN} strokeWidth={1.8} strokeLinejoin="round" />
            {stopSegments(dive).map((s, k) => (
              <SvgText key={k} x={tx(offset + (s.startMin + s.endMin) / 2)} y={ty(s.depthM) - 5}
                textAnchor="middle" fontSize={8} fill="#BA7517">
                {s.depthM}m·{Math.round(s.endMin - s.startMin)}'
              </SvgText>
            ))}
            <SvgText x={tx(offset)} y={PT + 9} fontSize={9} fill="#85B7EB">{i === 0 ? 'Plongée 1' : 'Plongée 2'}</SvgText>
          </React.Fragment>
        ))}

        {mn90First && (
          <Polyline points={polyline(mn90First)} fill="none" stroke={COLOR_MN90} strokeWidth={1.4}
            strokeDasharray="4,3" strokeLinejoin="round" />
        )}
        {mn90Second && (
          <Polyline points={polyline(shiftPoints(mn90Second, layout.secondStartMin))} fill="none" stroke={COLOR_MN90}
            strokeWidth={1.4} strokeDasharray="4,3" strokeLinejoin="round" />
        )}
      </Svg>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendLine, { backgroundColor: COLOR_BUHLMANN }]} /><Text style={styles.legendTxt}>Bühlmann</Text></View>
        {showMn90 && (
          <View style={styles.legendItem}><View style={[styles.legendLine, { backgroundColor: COLOR_MN90 }]} /><Text style={styles.legendTxt}>MN90</Text></View>
        )}
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
  plot: { alignSelf: 'stretch', height: HEIGHT },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  title: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: { backgroundColor: 'rgba(239,159,39,0.18)', borderColor: COLOR_MN90 },
  chipTxt: { fontSize: fontSize.xs, color: ocean.text.muted },
  chipTxtActive: { color: COLOR_MN90 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendLine: { width: 14, height: 2, borderRadius: 1 },
  legendTxt: { fontSize: 10, color: ocean.text.muted },
});
