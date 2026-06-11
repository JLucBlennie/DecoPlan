// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — TimelineControls
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export interface TimelineControlsProps {
  step: number;
  totalSteps: number;
  totalTimeMin: number;
  playing: boolean;
  speed: number;
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEEDS = [1, 4, 10, 30];

export function TimelineControls({
  step, totalSteps, totalTimeMin,
  playing, speed,
  onPlayPause, onReset, onSeek, onSpeedChange,
}: TimelineControlsProps) {

  const mins = Math.floor((step / totalSteps) * totalTimeMin);
  const secs = Math.round(((step / totalSteps) * totalTimeMin - mins) * 60);
  const timeLabel = `${mins}:${String(secs).padStart(2, '0')}`;
  const totalLabel = `${Math.floor(totalTimeMin)}:${String(Math.round((totalTimeMin % 1) * 60)).padStart(2, '0')}`;

  return (
    <View style={styles.container}>

      {/* Boutons play + reset */}
      <View style={styles.btnRow}>
        <TouchableOpacity onPress={onReset} style={styles.iconBtn} hitSlop={{ top:6, bottom:6, left:6, right:6 }}>
          {/* ⏮ */}
          <Text style={styles.iconTxt}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPlayPause} style={[styles.iconBtn, styles.playBtn]}>
          <Text style={[styles.iconTxt, { fontSize: 18 }]}>{playing ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        {/* Sélecteurs de vitesse */}
        {SPEEDS.map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => onSpeedChange(s)}
            style={[styles.speedBtn, speed === s && styles.speedBtnActive]}
          >
            <Text style={[styles.speedTxt, speed === s && styles.speedTxtActive]}>
              ×{s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Slider + temps */}
      <View style={styles.sliderRow}>
        <Text style={styles.timeTxt}>{timeLabel}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={totalSteps}
          step={1}
          value={step}
          onValueChange={onSeek}
          minimumTrackTintColor="#378ADD"
          maximumTrackTintColor="rgba(255,255,255,0.15)"
          thumbTintColor="#378ADD"
        />
        <Text style={styles.timeTxtMuted}>{totalLabel}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12, paddingBottom: 4,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  playBtn: {
    backgroundColor: 'rgba(55,138,221,0.25)',
    borderColor: '#378ADD',
  },
  iconTxt: { fontSize: 14, color: '#E8E8E6' },

  speedBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
  },
  speedBtnActive: {
    backgroundColor: 'rgba(55,138,221,0.2)',
    borderColor: '#378ADD',
  },
  speedTxt:       { fontSize: 11, color: '#888780' },
  speedTxtActive: { color: '#85B7EB', fontWeight: '500' },

  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slider: { flex: 1, height: 32 },
  timeTxt:     { fontSize: 11, fontWeight: '500', color: '#E8E8E6', minWidth: 34 },
  timeTxtMuted:{ fontSize: 11, color: '#5F5E5A', minWidth: 34, textAlign: 'right' },
});
