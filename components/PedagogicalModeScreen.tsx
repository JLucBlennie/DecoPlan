// components/PedagogicalModeScreen.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

import { usePedagogicalSimulation } from '../hooks/usePedagogicalSimulation';
import { DEFAULT_DT_MIN } from '../lib/dive/constants';
import { getMN90Profile } from '../lib/dive/mn90';
import type { MN90Profile, PedagogicalModeProps } from '../lib/dive/types';

import { CompartmentsPanel } from './CompartmentsPanel';
import { DiveProfileView } from './DiveProfileView';
import { DiveStatusPanel } from './DiveStatusPanel';
import { GasConsumptionPanel } from './GasConsumptionPanel';
import { TimelineControls } from './TimelineControls';

export function PedagogicalModeScreen({ plan, comparisonPlan, onClose }: PedagogicalModeProps) {

  // ── Simulations ───────────────────────────────────────────────────────────
  const simA = usePedagogicalSimulation(plan);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const simB = comparisonPlan ? usePedagogicalSimulation(comparisonPlan) : null;

  // ── Lecture ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  const curTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(0);

  const tick = useCallback(() => {
    const now = Date.now();
    const dtReal = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;
    curTimeRef.current = Math.min(simA.totalTimeMin, curTimeRef.current + dtReal * speed);
    const newStep = Math.min(simA.stepCount, Math.round(curTimeRef.current / DEFAULT_DT_MIN));
    setStep(newStep);
    if (curTimeRef.current >= simA.totalTimeMin) setPlaying(false);
  }, [speed, simA.totalTimeMin, simA.stepCount]);

  useEffect(() => {
    if (playing) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(tick, 50);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, tick]);

  const handlePlayPause = () => {
    if (step >= simA.stepCount) { setStep(0); curTimeRef.current = 0; }
    setPlaying(p => !p);
  };
  const handleReset = () => { setPlaying(false); setStep(0); curTimeRef.current = 0; };
  const handleSeek = (s: number) => { setPlaying(false); setStep(s); curTimeRef.current = s * DEFAULT_DT_MIN; };

  // ── Toggles ───────────────────────────────────────────────────────────────
  const [showComparison, setShowComparison] = useState(false);
  const [showMN90, setShowMN90] = useState(false);

  // ── Données courantes ─────────────────────────────────────────────────────
  const frameA = simA.frames[step];
  const frameB = simB ? simB.frames[Math.min(step, simB.stepCount)] : undefined;
  const comparing = showComparison && !!comparisonPlan && !!simB && !!frameB;
  const mn90Profile: MN90Profile | undefined = showMN90 ? getMN90Profile(plan) : undefined;

  // Labels GF pour la comparaison
  const labelA = comparing ? `GF ${Math.round(plan.gfLow * 100)}/${Math.round(plan.gfHigh * 100)}` : undefined;
  const labelB = comparing && comparisonPlan
    ? `GF ${Math.round(comparisonPlan.gfLow * 100)}/${Math.round(comparisonPlan.gfHigh * 100)}`
    : undefined;

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
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <TimelineControls
        step={step} totalSteps={simA.stepCount} totalTimeMin={simA.totalTimeMin}
        playing={playing} speed={speed}
        onPlayPause={handlePlayPause} onReset={handleReset}
        onSeek={handleSeek} onSpeedChange={setSpeed}
      />

      {/* Toggles */}
      <View style={styles.toggleRow}>
        {comparisonPlan && (
          <Chip label="Comparer" active={showComparison}
            onPress={() => setShowComparison(v => !v)} />
        )}
        <Chip label="MN90" active={showMN90}
          onPress={() => setShowMN90(v => !v)} />
      </View>

      {/* ── Zone principale : profil 3/4 + compartiments 1/4 ────────────── */}
      <View style={styles.mainRow}>

        {/* Profil — prend 3/4 de la largeur */}
        <DiveProfileView
          style={styles.profileArea}
          plan={plan}
          simulation={simA}
          currentStep={step}
          mn90Profile={mn90Profile}
          label={labelA}
          // En mode comparaison : overlay du 2e profil sur le même SVG
          comparisonPlan={comparing ? comparisonPlan : undefined}
          comparisonSimulation={comparing ? simB! : undefined}
          comparisonLabel={labelB}
        />

        {/* Compartiments — 1/4 de la largeur, compact */}
        <CompartmentsPanel
          style={styles.compartmentsArea}
          frame={frameA}
          numCompartments={16}
          compact
          label={labelA}
          // En mode comparaison : double barre par compartiment
          comparisonFrame={comparing ? frameB : undefined}
          comparisonLabel={labelB}
        />

      </View>

      {/* ── Bas de page fixe : consommation + état ───────────────────────── */}
      <View style={styles.bottomRow}>
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

    </SafeAreaView>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0F1E' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  headerTitle: { fontSize: 16, fontWeight: '500', color: '#E8E8E6' },
  headerSub: { fontSize: 11, color: '#888780', marginTop: 1 },
  closeBtn: { padding: 4 },
  closeBtnTxt: { fontSize: 18, color: '#888780' },

  toggleRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 6,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: { backgroundColor: 'rgba(55,138,221,0.2)', borderColor: '#378ADD' },
  chipTxt: { fontSize: 12, color: '#888780' },
  chipTxtActive: { color: '#85B7EB' },

  // ── Zone principale ────────────────────────────────────────────────────────
  mainRow: {
    flex: 1,                        // prend tout l'espace disponible
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 6,
    minHeight: 0,                   // nécessaire pour que flex fonctionne dans ScrollView
  },
  profileArea: { flex: 3 },   // 3/4 de la largeur
  compartmentsArea: { flex: 1 },   // 1/4 de la largeur

  // ── Bas de page ────────────────────────────────────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 6,
    gap: 6,
    height: 170,                    // hauteur fixe — ne pousse pas le contenu principal
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  flex1: { flex: 1 },
});