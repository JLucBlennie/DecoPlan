// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — DiveStatusPanel
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { ZHL16C_N2 } from '../lib/dive/constants';
import type { DivePlan, SimulationFrame } from '../lib/dive/types';

export interface DiveStatusPanelProps {
  plan: DivePlan;
  frame: SimulationFrame;
  style?: ViewStyle;
}

export function DiveStatusPanel({ plan, frame, style }: DiveStatusPanelProps) {
  const {
    timeMin, depthM, pAmbBar,
    leadingCompartmentIndex, saturationRatios,
    activeGasId, gasRemainingBar,
  } = frame;

  const phase = getPhase(plan, timeMin, depthM);
  const maxRatio = Math.max(...saturationRatios);
  const satColor = maxRatio > 0.88 ? '#D85A30' : maxRatio > 0.68 ? '#BA7517' : '#1D9E75';
  const lc = ZHL16C_N2[leadingCompartmentIndex];
  const activeGas = plan.gases.find(g => g.id === activeGasId);
  const lowestGas = [...plan.gases].sort(
    (a, b) => (gasRemainingBar[a.id] ?? 0) - (gasRemainingBar[b.id] ?? 0)
  )[0];
  const lowestPressure = gasRemainingBar[lowestGas?.id ?? ''] ?? 0;

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.sectionTitle}>État de la plongée</Text>

      {/* Phase en vedette */}
      <View style={[styles.phaseBanner, { borderColor: phase.color + '60' }]}>
        <Text style={[styles.phaseLabel, { color: phase.color }]}>{phase.label}</Text>
        <Text style={styles.phaseTime}>{formatTime(timeMin)}</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCell label="Profondeur"    value={`${Math.round(depthM)} m`} />
        <StatCell label="P ambiante"    value={`${pAmbBar.toFixed(1)} bar`} />
        <StatCell
          label="Compartiment limitant"
          value={`C${leadingCompartmentIndex + 1} — t½ ${lc?.halfTime} min`}
        />
        <StatCell
          label="Saturation max"
          value={`${Math.round(maxRatio * 100)} %`}
          valueColor={satColor}
        />
        {activeGas && (
          <StatCell
            label="Gaz actif"
            value={activeGas.label}
            valueColor="#85B7EB"
          />
        )}
        {lowestGas && (
          <StatCell
            label={`Réserve ${lowestGas.label}`}
            value={`${Math.round(lowestPressure)} bar`}
            valueColor={lowestPressure < 50 ? '#D85A30' : lowestPressure < 80 ? '#BA7517' : undefined}
          />
        )}
      </View>
    </View>
  );
}

// ── StatCell ──────────────────────────────────────────────────────────────────
function StatCell({
  label, value, valueColor,
}: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : undefined]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(totalMin: number): string {
  const m = Math.floor(totalMin);
  const s = Math.round((totalMin - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface PhaseInfo { label: string; color: string; }

function getPhase(plan: DivePlan, t: number, depth: number): PhaseInfo {
  const seg = plan.segments.find(s => t >= s.startTimeMin && t <= s.endTimeMin);
  if (!seg) return { label: 'Surface', color: '#5F5E5A' };

  if (seg.startDepthM === seg.endDepthM && depth === 0) {
    return { label: 'Surface', color: '#5F5E5A' };
  }
  if (seg.endDepthM > seg.startDepthM) {
    return { label: 'Descente', color: '#378ADD' };
  }
  if (seg.endDepthM < seg.startDepthM) {
    return { label: 'Remontée', color: '#378ADD' };
  }
  // Segment plat
  if (depth > 8) {
    return { label: `Fond — ${Math.round(depth)} m`, color: '#1D9E75' };
  }
  return { label: `Palier déco — ${Math.round(depth)} m`, color: '#BA7517' };
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
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6,
  },

  phaseBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 0.5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 8,
  },
  phaseLabel: { fontSize: 13, fontWeight: '500' },
  phaseTime:  { fontSize: 12, color: '#5F5E5A' },

  statsGrid: { gap: 5 },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: '#5F5E5A', flex: 1 },
  statValue: { fontSize: 11, fontWeight: '500', color: '#E8E8E6', textAlign: 'right' },
});
