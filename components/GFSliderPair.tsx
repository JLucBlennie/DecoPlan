// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — GFSliderPair
// Deux sliders couplés GF Low / GF High avec contrainte gfLow ≤ gfHigh.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export interface GFValues {
  gfLow:  number;  // 0.10 – 0.85
  gfHigh: number;  // 0.50 – 1.00
}

export interface GFSliderPairProps {
  values:    GFValues;
  onChange:  (next: GFValues) => void;
  /** Couleur d'accent pour les tracks actifs */
  accentColor?: string;
  disabled?: boolean;
}

const GF_LOW_MIN  = 0.10;
const GF_LOW_MAX  = 0.85;
const GF_HIGH_MIN = 0.50;
const GF_HIGH_MAX = 1.00;
const STEP        = 0.05;

export function GFSliderPair({
  values, onChange, accentColor = '#378ADD', disabled = false,
}: GFSliderPairProps) {
  const { gfLow, gfHigh } = values;

  const handleLowChange = (v: number) => {
    const next = Math.round(v / STEP) * STEP;
    onChange({
      gfLow:  next,
      // gfHigh ne peut pas descendre en dessous de gfLow
      gfHigh: Math.max(gfHigh, next),
    });
  };

  const handleHighChange = (v: number) => {
    const next = Math.round(v / STEP) * STEP;
    onChange({
      // gfLow ne peut pas monter au dessus de gfHigh
      gfLow:  Math.min(gfLow, next),
      gfHigh: next,
    });
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <GFRow
        label="GF Low"
        tooltip="Profondeur du premier palier"
        value={gfLow}
        min={GF_LOW_MIN}
        max={GF_LOW_MAX}
        step={STEP}
        accentColor={accentColor}
        onChange={handleLowChange}
        disabled={disabled}
      />
      <GFRow
        label="GF High"
        tooltip="Palier de surface"
        value={gfHigh}
        min={GF_HIGH_MIN}
        max={GF_HIGH_MAX}
        step={STEP}
        accentColor={accentColor}
        onChange={handleHighChange}
        disabled={disabled}
      />

      {/* Indicateur visuel de la pente */}
      <GFSlopeIndicator gfLow={gfLow} gfHigh={gfHigh} accentColor={accentColor} />
    </View>
  );
}

// ── GFRow ────────────────────────────────────────────────────────────────────

interface GFRowProps {
  label:       string;
  tooltip:     string;
  value:       number;
  min:         number;
  max:         number;
  step:        number;
  accentColor: string;
  onChange:    (v: number) => void;
  disabled:    boolean;
}

function GFRow({ label, tooltip, value, min, max, step, accentColor, onChange, disabled }: GFRowProps) {
  const pct = Math.round(value * 100);

  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={styles.gfLabel}>{label}</Text>
        <Text style={styles.gfTooltip}>{tooltip}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={disabled ? 'rgba(255,255,255,0.15)' : accentColor}
        maximumTrackTintColor="rgba(255,255,255,0.12)"
        thumbTintColor={disabled ? 'rgba(255,255,255,0.3)' : accentColor}
        disabled={disabled}
      />
      <Text style={[styles.gfValue, { color: disabled ? '#444441' : accentColor }]}>
        {pct}%
      </Text>
    </View>
  );
}

// ── GFSlopeIndicator ─────────────────────────────────────────────────────────

function GFSlopeIndicator({
  gfLow, gfHigh, accentColor,
}: { gfLow: number; gfHigh: number; accentColor: string }) {
  const isConservative = gfLow <= 0.35;
  const isOpen         = gfHigh >= 0.90;

  return (
    <View style={styles.slopeRow}>
      <View style={styles.slopeDot} />
      <View style={[styles.slopeLine, { borderColor: accentColor + '60' }]} />
      <View style={[styles.slopeDot, { backgroundColor: accentColor }]} />
      <Text style={styles.slopeLabel}>
        Pente GF : {Math.round(gfLow * 100)} → {Math.round(gfHigh * 100)}%
        {isConservative ? '  · conservateur' : isOpen ? '  · ouvert' : ''}
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: 2 },
  disabled:  { opacity: 0.4 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  labelCol: { width: 70 },
  gfLabel:   { fontSize: 12, fontWeight: '500', color: '#E8E8E6' },
  gfTooltip: { fontSize: 9,  color: '#5F5E5A', marginTop: 1 },
  slider: { flex: 1, height: 32 },
  gfValue: {
    fontSize: 13, fontWeight: '500', minWidth: 38, textAlign: 'right',
  },

  slopeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6,
  },
  slopeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  slopeLine: {
    flex: 1, height: 0,
    borderTopWidth: 1, borderStyle: 'dashed',
  },
  slopeLabel: { fontSize: 9, color: '#5F5E5A' },
});
