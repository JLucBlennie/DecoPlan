// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — GasConsumptionPanel
// Multi-manomètres avec indicateur de gaz actif et zones de commutation
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import type { GasConso, SimulationFrame } from '../lib/dive/types';
import { ManometerGauge } from './ManometerGauge';

export interface GasConsumptionPanelProps {
  gases: GasConso[];
  frame: SimulationFrame;
  style?: ViewStyle;
}

// Couleur d'accent par rôle et type de gaz
const GAS_ACCENT: Record<string, string> = {
  bottom: '#85B7EB',   // bleu — gaz fond
  deco:   '#9FE1CB',   // teal — gaz déco
};

const GAS_ROLE_LABEL: Record<string, string> = {
  bottom: 'Fond',
  deco:   'Déco',
};

export function GasConsumptionPanel({ gases, frame, style }: GasConsumptionPanelProps) {
  const { gasRemainingBar, activeGasId } = frame;

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.sectionTitle}>Consommation gaz</Text>

      <View style={styles.gaugesRow}>
        {gases.map(gas => {
          const pressure = gasRemainingBar[gas.id] ?? gas.startPressureBar;
          const isActive = gas.id === activeGasId;
          const accent = GAS_ACCENT[gas.role] ?? '#85B7EB';

          return (
            <View key={gas.id} style={styles.gaugeWrapper}>

              {/* Indicateur "gaz actif" */}
              {isActive ? (
                <View style={styles.activePill}>
                  <Text style={styles.activePillTxt}>● Actif</Text>
                </View>
              ) : (
                <View style={styles.activePillPlaceholder} />
              )}

              {/* Manomètre */}
              <ManometerGauge
                pressureBar={pressure}
                maxPressureBar={gas.startPressureBar <= 200 ? 200 : 300}
                reservePressureBar={gas.startPressureBar * 0.17} // ~17% = réserve
                size={isActive ? 100 : 88}
                gasLabel={gas.label}
                accentColor={isActive ? accent : 'rgba(255,255,255,0.3)'}
              />

              {/* Infos gaz */}
              <View style={styles.gasInfo}>
                <View style={[styles.roleBadge, gas.role === 'deco' && styles.roleBadgeDeco]}>
                  <Text style={[styles.roleTxt, gas.role === 'deco' && styles.roleTxtDeco]}>
                    {GAS_ROLE_LABEL[gas.role]}
                  </Text>
                </View>
                <Text style={styles.composition}>
                  {describeGas(gas)}
                </Text>
                {gas.switchDepthM !== undefined && (
                  <Text style={styles.switchDepth}>↗ {gas.switchDepthM} m</Text>
                )}
              </View>

              {/* Barre de niveau */}
              <View style={styles.levelBarOuter}>
                <View style={[
                  styles.levelBarInner,
                  {
                    width: `${(pressure / gas.startPressureBar) * 100}%` as any,
                    backgroundColor: pressure < gas.startPressureBar * 0.17
                      ? '#D85A30'
                      : pressure < gas.startPressureBar * 0.25
                      ? '#BA7517'
                      : isActive ? accent : 'rgba(255,255,255,0.2)',
                  },
                ]} />
              </View>
              <Text style={styles.barPressure}>
                {Math.round(pressure)} / {gas.startPressureBar} bar
              </Text>

            </View>
          );
        })}
      </View>
    </View>
  );
}

function describeGas(gas: GasConso): string {
  if (gas.fHe > 0) return `${Math.round(gas.fO2 * 100)}/${Math.round(gas.fHe * 100)} TMX`;
  if (gas.fO2 > 0.95) return 'O₂ 100%';
  if (gas.fO2 > 0.21) return `EAN ${Math.round(gas.fO2 * 100)}`;
  return 'Air';
}

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
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
  },
  gaugesRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-around',
  },
  gaugeWrapper: {
    alignItems: 'center', gap: 3, minWidth: 80,
  },

  activePill: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
    backgroundColor: 'rgba(55,138,221,0.2)', borderWidth: 0.5, borderColor: '#378ADD',
  },
  activePillTxt: { fontSize: 9, color: '#85B7EB' },
  activePillPlaceholder: { height: 18 },

  gasInfo: { alignItems: 'center', gap: 2 },
  roleBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
    backgroundColor: 'rgba(55,138,221,0.1)',
  },
  roleBadgeDeco: { backgroundColor: 'rgba(29,158,117,0.1)' },
  roleTxt:     { fontSize: 9, color: '#378ADD' },
  roleTxtDeco: { color: '#1D9E75' },
  composition: { fontSize: 9, color: '#888780' },
  switchDepth: { fontSize: 8, color: '#5F5E5A' },

  levelBarOuter: {
    width: 80, height: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 2, overflow: 'hidden',
    marginTop: 2,
  },
  levelBarInner: { height: '100%', borderRadius: 2 },
  barPressure: { fontSize: 8, color: '#444441', marginTop: 1 },
});
