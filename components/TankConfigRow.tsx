// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — TankConfigRow
// Une ligne de configuration de bloc par gaz.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

import type { TankConfig } from '../lib/dive/buildDivePlan';

// Volumes standards proposés dans le picker rapide
const QUICK_VOLUMES = [7, 10, 12, 15, 18];

export interface TankConfigRowProps {
  tank:     TankConfig;
  gasLabel: string;   // libellé lisible du gaz (ex. "Air", "EAN 50")
  gasRole:  'bottom' | 'deco';
  onChange: (updated: TankConfig) => void;
}

export function TankConfigRow({ tank, gasLabel, gasRole, onChange }: TankConfigRowProps) {
  const [pressureStr, setPressureStr] = useState(String(tank.startPressureBar));

  const handleVolumeChange = (v: number) => {
    onChange({ ...tank, volumeLiters: v });
  };

  const handlePressureBlur = () => {
    const parsed = parseInt(pressureStr, 10);
    if (!isNaN(parsed) && parsed >= 50 && parsed <= 350) {
      onChange({ ...tank, startPressureBar: parsed });
    } else {
      // Revert si valeur invalide
      setPressureStr(String(tank.startPressureBar));
    }
  };

  const roleColor = gasRole === 'deco' ? '#1D9E75' : '#378ADD';
  const roleBg    = gasRole === 'deco' ? 'rgba(29,158,117,0.1)' : 'rgba(55,138,221,0.1)';

  return (
    <View style={styles.row}>

      {/* Gaz */}
      <View style={styles.gasCol}>
        <Text style={styles.gasLabel}>{gasLabel}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleBg }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>
            {gasRole === 'deco' ? 'Déco' : 'Fond'}
          </Text>
        </View>
      </View>

      {/* Volume : touches rapides */}
      <View style={styles.volumeCol}>
        <Text style={styles.colHeader}>Volume</Text>
        <View style={styles.volumePicker}>
          {QUICK_VOLUMES.map(v => (
            <TouchableOpacity
              key={v}
              onPress={() => handleVolumeChange(v)}
              style={[styles.volumeBtn, tank.volumeLiters === v && styles.volumeBtnActive]}
            >
              <Text style={[styles.volumeBtnTxt, tank.volumeLiters === v && styles.volumeBtnTxtActive]}>
                {v}L
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pression de départ */}
      <View style={styles.pressureCol}>
        <Text style={styles.colHeader}>Pression init.</Text>
        <View style={styles.pressureInputWrapper}>
          <TextInput
            style={styles.pressureInput}
            value={pressureStr}
            onChangeText={setPressureStr}
            onBlur={handlePressureBlur}
            keyboardType="number-pad"
            maxLength={3}
            selectTextOnFocus
          />
          <Text style={styles.pressureUnit}>bar</Text>
        </View>
        {/* Raccourcis pression */}
        <View style={styles.pressureShortcuts}>
          {[200, 232, 300].map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => {
                onChange({ ...tank, startPressureBar: p });
                setPressureStr(String(p));
              }}
            >
              <Text style={[
                styles.shortcutTxt,
                tank.startPressureBar === p && styles.shortcutActive,
              ]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, paddingVertical: 8,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.07)',
  },

  gasCol: { width: 68, gap: 4, paddingTop: 2 },
  gasLabel: { fontSize: 13, fontWeight: '500', color: '#E8E8E6' },
  roleBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  roleText: { fontSize: 9, fontWeight: '500' },

  volumeCol:   { flex: 1, gap: 4 },
  pressureCol: { width: 90, gap: 4 },
  colHeader:   { fontSize: 9, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: 0.5 },

  volumePicker: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  volumeBtn: {
    paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  volumeBtnActive: {
    backgroundColor: 'rgba(55,138,221,0.2)', borderColor: '#378ADD',
  },
  volumeBtnTxt:       { fontSize: 11, color: '#888780' },
  volumeBtnTxtActive: { color: '#85B7EB', fontWeight: '500' },

  pressureInputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  pressureInput: {
    flex: 1, fontSize: 14, fontWeight: '500',
    color: '#E8E8E6', textAlign: 'center', padding: 0,
  },
  pressureUnit: { fontSize: 10, color: '#5F5E5A' },

  pressureShortcuts: { flexDirection: 'row', gap: 6, marginTop: 3 },
  shortcutTxt:   { fontSize: 9, color: '#444441' },
  shortcutActive:{ color: '#85B7EB', fontWeight: '500' },
});
