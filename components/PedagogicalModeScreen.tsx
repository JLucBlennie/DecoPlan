// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — Écran Mode Pédagogique
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';

import { usePedagogicalSimulation } from '../hooks/usePedagogicalSimulation';
import { DEFAULT_DT_MIN } from '../lib/dive/constants';
import type { MN90Profile, PedagogicalModeProps } from '../lib/dive/types';

import { getMN90Profile } from '../lib/dive/mn90'; // table MN90 lookup (voir mn90.ts)
import { CompartmentsPanel } from './CompartmentsPanel';
import { DiveProfileView } from './DiveProfileView';
import { DiveStatusPanel } from './DiveStatusPanel';
import { GasConsumptionPanel } from './GasConsumptionPanel';
import { TimelineControls } from './TimelineControls';

export function PedagogicalModeScreen({
  plan,
  comparisonPlan,
  onClose,
}: PedagogicalModeProps) {

  // ── Simulations pré-calculées ─────────────────────────────────────────────
  const simA = usePedagogicalSimulation(plan);
  const simB = comparisonPlan
    ? usePedagogicalSimulation(comparisonPlan)
    : null;

  // ── État de lecture ───────────────────────────────────────────────────────
  const [step, setStep]       = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed]     = useState(4);
  const curTimeRef            = useRef(0);
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef           = useRef<number>(0);

  // ── Toggles ───────────────────────────────────────────────────────────────
  const [showComparison, setShowComparison] = useState(false);
  const [showMN90, setShowMN90]             = useState(false);

  // ── Boucle d'animation ────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const now = Date.now();
    const dtReal = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;

    curTimeRef.current = Math.min(
      simA.totalTimeMin,
      curTimeRef.current + dtReal * speed
    );
    const newStep = Math.min(
      simA.stepCount,
      Math.round(curTimeRef.current / DEFAULT_DT_MIN)
    );
    setStep(newStep);

    if (curTimeRef.current >= simA.totalTimeMin) {
      setPlaying(false);
    }
  }, [speed, simA.totalTimeMin, simA.stepCount]);

  useEffect(() => {
    if (playing) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(tick, 50); // ~20 fps
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, tick]);

  // ── Contrôles de lecture ──────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (step >= simA.stepCount) { setStep(0); curTimeRef.current = 0; }
    setPlaying(p => !p);
  };

  const handleReset = () => {
    setPlaying(false);
    setStep(0);
    curTimeRef.current = 0;
  };

  const handleSeek = (newStep: number) => {
    setPlaying(false);
    setStep(newStep);
    curTimeRef.current = newStep * DEFAULT_DT_MIN;
  };

  // ── Frames courantes ──────────────────────────────────────────────────────
  const frameA = simA.frames[step];
  const frameB = simB
    ? simB.frames[Math.min(step, simB.stepCount)]
    : undefined;

  const mn90Profile: MN90Profile | undefined = showMN90
    ? getMN90Profile(plan)
    : undefined;

  const comparing = showComparison && !!comparisonPlan && !!simB && !!frameB;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* En-tête */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{plan.name}</Text>
          <Text style={styles.headerSub}>Mode pédagogique</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
          <Text style={styles.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <TimelineControls
        step={step}
        totalSteps={simA.stepCount}
        totalTimeMin={simA.totalTimeMin}
        playing={playing}
        speed={speed}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSeek={handleSeek}
        onSpeedChange={setSpeed}
      />

      {/* Toggles */}
      <View style={styles.toggleRow}>
        {comparisonPlan && (
          <ToggleChip
            label="Comparer"
            active={showComparison}
            onPress={() => setShowComparison(v => !v)}
          />
        )}
        <ToggleChip
          label="Référence MN90"
          active={showMN90}
          onPress={() => setShowMN90(v => !v)}
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Ligne 1 : Profils de plongée */}
        <View style={styles.row}>
          <DiveProfileView
            style={styles.flex1}
            plan={plan}
            simulation={simA}
            currentStep={step}
            mn90Profile={mn90Profile}
            label={comparing ? `GF ${plan.gfLow * 100}/${plan.gfHigh * 100}` : undefined}
          />
          {comparing && (
            <DiveProfileView
              style={styles.flex1}
              plan={comparisonPlan!}
              simulation={simB!}
              currentStep={Math.min(step, simB!.stepCount)}
              label={`GF ${comparisonPlan!.gfLow * 100}/${comparisonPlan!.gfHigh * 100}`}
            />
          )}
        </View>

        {/* Ligne 2 : Compartiments */}
        <View style={styles.row}>
          <CompartmentsPanel
            style={styles.flex1}
            frame={frameA}
            numCompartments={16}
            label={comparing ? `GF ${plan.gfLow * 100}/${plan.gfHigh * 100}` : undefined}
          />
          {comparing && (
            <CompartmentsPanel
              style={styles.flex1}
              frame={frameB!}
              numCompartments={16}
              label={`GF ${comparisonPlan!.gfLow * 100}/${comparisonPlan!.gfHigh * 100}`}
            />
          )}
        </View>

        {/* Ligne 3 : Consommation gaz + État */}
        <View style={styles.row}>
          <GasConsumptionPanel
            style={styles.flex1}
            gases={plan.gases}
            frame={frameA}
          />
          <DiveStatusPanel
            style={styles.flex1}
            plan={plan}
            frame={frameA}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── ToggleChip ────────────────────────────────────────────────────────────────
function ToggleChip({
  label, active, onPress,
}: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0F1E',   // fond sombre nautique
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  headerTitle: { fontSize: 16, fontWeight: '500', color: '#E8E8E6' },
  headerSub:   { fontSize: 11, color: '#888780', marginTop: 1 },
  closeBtn:    { padding: 4 },
  closeBtnTxt: { fontSize: 18, color: '#888780' },

  toggleRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 6,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: {
    backgroundColor: 'rgba(55,138,221,0.2)',
    borderColor: '#378ADD',
  },
  chipTxt:       { fontSize: 12, color: '#888780' },
  chipTxtActive: { color: '#85B7EB' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 8, paddingBottom: 16, gap: 8 },

  row:  { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
});
