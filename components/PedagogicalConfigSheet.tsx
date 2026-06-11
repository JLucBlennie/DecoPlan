// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — PedagogicalConfigSheet
// Bottom sheet de configuration avant le lancement du mode pédagogique.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { Plan } from '../lib/dive/buhlmann';
import type { DivePlan } from '../lib/dive/types';

import { usePedagogicalLaunch } from '../hooks/usePedagogicalLaunch';
import { labelFromComposition } from '../lib/dive/buildDivePlan';
import { GFSliderPair } from './GFSliderPair';
import { TankConfigRow } from './TankConfigRow';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PedagogicalConfigSheetProps {
  plan:     Plan;
  planName: string;

  /** GF actuellement utilisés dans le calcul (pré-remplissage bloc A). */
  currentGfLow:  number;
  currentGfHigh: number;

  /**
   * Reçoit les plans construits → à transmettre à PedagogicalModeScreen.
   * Typiquement : navigation.navigate('PedagogicalMode', { planA, planB })
   */
  onLaunch: (planA: DivePlan, planB: DivePlan | undefined) => void;

  /** Contrôle externe de la visibilité (optionnel si vous utilisez PedagogicalLaunchButton). */
  visible?:  boolean;
  onClose?:  () => void;
}

// ── Composant principal ───────────────────────────────────────────────────────

export function PedagogicalConfigSheet({
  plan, planName, currentGfLow, currentGfHigh, onLaunch,
  visible: visibleProp, onClose: onCloseProp,
}: PedagogicalConfigSheetProps) {

  const {
    visible, open, close,
    config, stopSummary,
    handlers: { setGfA, setGfB, toggleComparison, updateTank },
    launch,
  } = usePedagogicalLaunch(plan, {
    planName, currentGfLow, currentGfHigh,
    onLaunch,
  });

  const isVisible = visibleProp ?? visible;
  const handleClose = onCloseProp ?? close;

  // Merge bottom + deco gases pour l'affichage des blocs
  const allGasEntries = [
    ...Object.values(plan.bottomGasses).map(g => ({ gas: g, role: 'bottom' as const })),
    ...Object.values(plan.decoGasses).map(g => ({ gas: g, role: 'deco'   as const })),
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Fond semi-transparent — tap pour fermer */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Sheet */}
      <View style={styles.sheet}>

        {/* Handle */}
        <View style={styles.handle} />

        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mode pédagogique</Text>
            <Text style={styles.subtitle}>{planName}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top:8,bottom:8,left:8,right:8 }}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Bloc A ─────────────────────────────────────────────────── */}
          <Section
            label="Réglage A"
            badge={`ZHL-16${config.variant.replace('ZHL16', '')}`}
            badgeColor="#378ADD"
          >
            <GFSliderPair
              values={config.gfA}
              onChange={setGfA}
              accentColor="#378ADD"
            />
          </Section>

          {/* ── Comparaison ────────────────────────────────────────────── */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Comparer un 2ème réglage</Text>
              <Text style={styles.toggleSub}>
                Même profil, GF différents, côte à côte
              </Text>
            </View>
            <Switch
              value={config.showComparison}
              onValueChange={toggleComparison}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(55,138,221,0.4)' }}
              thumbColor={config.showComparison ? '#378ADD' : '#888780'}
            />
          </View>

          {/* ── Bloc B ─────────────────────────────────────────────────── */}
          {config.showComparison && (
            <Section label="Réglage B" badge="GF alternatifs" badgeColor="#1D9E75">
              <GFSliderPair
                values={config.gfB}
                onChange={setGfB}
                accentColor="#1D9E75"
              />
            </Section>
          )}

          {/* ── Blocs / bouteilles ─────────────────────────────────────── */}
          <Section label="Blocs" badge={`${allGasEntries.length} gaz`} badgeColor="#5F5E5A">
            {allGasEntries.map(({ gas, role }) => {
              const tank = config.tanks.find(t => t.gasName === gas.name) ?? {
                gasName: gas.name, volumeLiters: 12, startPressureBar: 200,
              };
              return (
                <TankConfigRow
                  key={gas.name}
                  tank={tank}
                  gasLabel={labelFromComposition(gas.fO2, gas.fHe)}
                  gasRole={role}
                  onChange={updateTank}
                />
              );
            })}
          </Section>

          {/* ── Résumé des paliers calculés ────────────────────────────── */}
          {stopSummary.length > 0 && (
            <Section label="Paliers calculés" badge="lecture seule" badgeColor="#5F5E5A">
              {stopSummary.map((stop, i) => (
                <View key={i} style={styles.stopRow}>
                  <Text style={styles.stopDepth}>{stop.depthM} m</Text>
                  <Text style={styles.stopDuration}>{stop.durationMin} min</Text>
                  <Text style={styles.stopGas}>{stop.gasLabel}</Text>
                </View>
              ))}
              {stopSummary.length === 0 && (
                <Text style={styles.noStopTxt}>Plongée sans décompression</Text>
              )}
            </Section>
          )}

          {stopSummary.length === 0 && (
            <View style={styles.ndlBanner}>
              <Text style={styles.ndlText}>
                ✓  Plongée sans palier de décompression
              </Text>
            </View>
          )}

        </ScrollView>

        {/* Bouton de lancement */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.launchBtn} onPress={launch} activeOpacity={0.85}>
            <Text style={styles.launchBtnTxt}>
              ▶  Lancer le mode pédagogique
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  label, badge, badgeColor, children,
}: {
  label: string; badge?: string; badgeColor?: string; children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.header}>
        <Text style={sectionStyles.label}>{label}</Text>
        {badge && (
          <View style={[sectionStyles.badge, { backgroundColor: (badgeColor ?? '#5F5E5A') + '22' }]}>
            <Text style={[sectionStyles.badgeTxt, { color: badgeColor ?? '#5F5E5A' }]}>
              {badge}
            </Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14, gap: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label:  { fontSize: 12, fontWeight: '500', color: '#E8E8E6' },
  badge:  {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  badgeTxt: { fontSize: 10 },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0D1526',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
    maxHeight: '92%',
    paddingBottom: 34,   // safe area iOS
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title:    { fontSize: 17, fontWeight: '500', color: '#E8E8E6' },
  subtitle: { fontSize: 12, color: '#5F5E5A', marginTop: 2 },
  closeBtn: { fontSize: 18, color: '#5F5E5A', padding: 2 },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, gap: 12,
  },

  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6,
  },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: '#E8E8E6' },
  toggleSub:   { fontSize: 11, color: '#5F5E5A', marginTop: 2 },

  stopRow: {
    flexDirection: 'row', gap: 10, paddingVertical: 4,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  stopDepth:    { fontSize: 13, fontWeight: '500', color: '#BA7517', width: 36 },
  stopDuration: { fontSize: 13, color: '#E8E8E6', width: 48 },
  stopGas:      { fontSize: 12, color: '#5F5E5A' },
  noStopTxt:    { fontSize: 12, color: '#5F5E5A' },

  ndlBanner: {
    backgroundColor: 'rgba(29,158,117,0.1)',
    borderRadius: 10, borderWidth: 0.5, borderColor: '#1D9E75',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  ndlText: { fontSize: 13, color: '#1D9E75' },

  footer: {
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  launchBtn: {
    backgroundColor: '#185FA5', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  launchBtnTxt: { fontSize: 15, fontWeight: '500', color: '#E8F3FB' },
});
