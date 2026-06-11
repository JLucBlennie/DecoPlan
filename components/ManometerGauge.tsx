// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — ManometerGauge (react-native-svg)
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

export interface ManometerGaugeProps {
  /** Pression actuelle (bar) */
  pressureBar: number;
  /** Pression maximale (bar) — default 300 */
  maxPressureBar?: number;
  /** Pression de réserve — aiguille passe en rouge (bar) — default 50 */
  reservePressureBar?: number;
  /** Diamètre SVG du manomètre (px) — default 120 */
  size?: number;
  /** Nom du gaz affiché sous la valeur */
  gasLabel?: string;
  /** Couleur d'accent (pour le gaz actif) */
  accentColor?: string;
}

const TWO_PI = 2 * Math.PI;
// Le cadran va de 150° (0 bar) à 390°/30° (max bar) dans le sens horaire (SVG)
const START_ANGLE_DEG = 150;
const SWEEP_DEG = 240;

function degToRad(deg: number) { return (deg * Math.PI) / 180; }

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const a = degToRad(angleDeg);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string {
  const start = polarPoint(cx, cy, r, startDeg);
  const end   = polarPoint(cx, cy, r, startDeg + sweepDeg);
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function ManometerGauge({
  pressureBar,
  maxPressureBar = 300,
  reservePressureBar = 50,
  size = 120,
  gasLabel,
  accentColor = '#85B7EB',
}: ManometerGaugeProps) {

  const cx = size / 2;
  const cy = size / 2;
  const R  = size * 0.44;
  const r  = R - 5;       // rayon de l'arc de graduation

  const ratio = Math.min(1, Math.max(0, pressureBar / maxPressureBar));
  const reserveRatio = reservePressureBar / maxPressureBar;
  const needleAngleDeg = START_ANGLE_DEG + ratio * SWEEP_DEG;
  const reserveEndDeg  = START_ANGLE_DEG + reserveRatio * SWEEP_DEG;

  const needleTip  = polarPoint(cx, cy, R - 10, needleAngleDeg);
  const needleTail = polarPoint(cx, cy, 10, needleAngleDeg + 180);

  const inReserve = pressureBar <= reservePressureBar;
  const needleColor = inReserve ? '#D85A30' : accentColor;

  const tickValues = maxPressureBar <= 100
    ? [0, 25, 50, 75, 100]
    : [0, 50, 100, 150, 200, 250, 300];

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>

        {/* Fond + bord */}
        <Circle cx={cx} cy={cy} r={R} fill="#111827" />
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />

        {/* Arc de réserve (rouge) */}
        <Path
          d={arcPath(cx, cy, r, START_ANGLE_DEG, reserveRatio * SWEEP_DEG)}
          fill="none" stroke="#7B2020" strokeWidth={4} strokeLinecap="round"
        />

        {/* Arc principal */}
        <Path
          d={arcPath(cx, cy, r, reserveEndDeg, (1 - reserveRatio) * SWEEP_DEG)}
          fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={4} strokeLinecap="round"
        />

        {/* Traits de graduation + labels */}
        {tickValues.map(v => {
          const deg = START_ANGLE_DEG + (v / maxPressureBar) * SWEEP_DEG;
          const inner = polarPoint(cx, cy, R - 5, deg);
          const outer = polarPoint(cx, cy, R - 12, deg);
          const lbl   = polarPoint(cx, cy, R - 22, deg);
          return (
            <React.Fragment key={v}>
              <Line
                x1={inner.x.toFixed(2)} y1={inner.y.toFixed(2)}
                x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
                stroke="rgba(255,255,255,0.4)" strokeWidth={1.5}
              />
              <SvgText
                x={lbl.x.toFixed(2)} y={lbl.y.toFixed(2)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={size < 100 ? 7 : 8.5}
                fill="rgba(255,255,255,0.45)"
              >{v}</SvgText>
            </React.Fragment>
          );
        })}

        {/* Aiguille */}
        <Line
          x1={needleTail.x.toFixed(2)} y1={needleTail.y.toFixed(2)}
          x2={needleTip.x.toFixed(2)}  y2={needleTip.y.toFixed(2)}
          stroke={needleColor} strokeWidth={2.5} strokeLinecap="round"
        />

        {/* Moyeu */}
        <Circle cx={cx} cy={cy} r={6} fill="rgba(255,255,255,0.15)" />
        <Circle cx={cx} cy={cy} r={3} fill={needleColor} />

        {/* Label "bar" */}
        <SvgText
          x={cx} y={cy + R - 18}
          textAnchor="middle" fontSize={8}
          fill="rgba(255,255,255,0.3)"
        >bar</SvgText>

      </Svg>

      {/* Valeur numérique */}
      <Text style={[styles.value, inReserve && styles.valueReserve]}>
        {Math.round(pressureBar)}
      </Text>
      {gasLabel && (
        <Text style={styles.gasLabel}>{gasLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 2 },
  value: {
    fontSize: 18, fontWeight: '500', color: '#E8E8E6',
    marginTop: -4,
  },
  valueReserve: { color: '#D85A30' },
  gasLabel: { fontSize: 11, color: '#5F5E5A', marginTop: 1 },
});
