// Configuration du mode pédagogique sur une plongée, DANS l'écran (plus de fenêtre modale) :
// réglage A, comparaison avec un réglage B, blocs, paliers calculés, bouton de lancement.
// Même logique que PedagogicalConfigSheet (hook usePedagogicalLaunch), sans Modal.
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { usePedagogicalLaunch } from '../../hooks/usePedagogicalLaunch';
import { labelFromComposition } from '../../lib/dive/buildDivePlan';
import type { Plan } from '../../lib/dive/buhlmann';
import type { DivePlan } from '../../lib/dive/types';
import { GFSliderPair } from '../GFSliderPair';
import { TankConfigRow } from '../TankConfigRow';
import ConfigSection from './ConfigSection';

export interface PedagogicalConfigPanelProps {
  plan: Plan;
  planName: string;
  /** GF qui pré-remplissent le réglage A. */
  currentGfLow: number;
  currentGfHigh: number;
  onLaunch: (planA: DivePlan, planB: DivePlan | undefined) => void;
}

export default function PedagogicalConfigPanel({
  plan, planName, currentGfLow, currentGfHigh, onLaunch,
}: PedagogicalConfigPanelProps) {
  const {
    config, stopSummary,
    handlers: { setGfA, setGfB, toggleComparison, updateTank },
    launch,
  } = usePedagogicalLaunch(plan, { planName, currentGfLow, currentGfHigh, onLaunch });

  const gasEntries = [
    ...Object.values(plan.bottomGasses).map(gas => ({ gas, role: 'bottom' as const })),
    ...Object.values(plan.decoGasses).map(gas => ({ gas, role: 'deco' as const })),
  ];

  return (
    <View style={styles.root}>
      <ConfigSection label="Réglage A" badge={`ZHL-16${config.variant.replace('ZHL16', '')}`} badgeColor="#378ADD">
        <GFSliderPair values={config.gfA} onChange={setGfA} accentColor="#378ADD" />
      </ConfigSection>

      <View style={styles.toggleRow}>
        <View style={styles.toggleTexts}>
          <Text style={styles.toggleLabel}>Comparer un 2ème réglage</Text>
          <Text style={styles.toggleSub}>Même profil, GF différents, côte à côte</Text>
        </View>
        <Switch
          value={config.showComparison}
          onValueChange={toggleComparison}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(55,138,221,0.4)' }}
          thumbColor={config.showComparison ? '#378ADD' : '#888780'}
        />
      </View>

      {config.showComparison && (
        <ConfigSection label="Réglage B" badge="GF alternatifs" badgeColor="#1D9E75">
          <GFSliderPair values={config.gfB} onChange={setGfB} accentColor="#1D9E75" />
        </ConfigSection>
      )}

      <ConfigSection label="Blocs" badge={`${gasEntries.length} gaz`}>
        {gasEntries.map(({ gas, role }) => {
          const tank = config.tanks.find(t => t.gasName === gas.name)
            ?? { gasName: gas.name, volumeLiters: 12, startPressureBar: 200 };
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
      </ConfigSection>

      {stopSummary.length > 0 ? (
        <ConfigSection label="Paliers calculés" badge="lecture seule">
          {stopSummary.map((stop, i) => (
            <View key={i} style={styles.stopRow}>
              <Text style={styles.stopDepth}>{stop.depthM} m</Text>
              <Text style={styles.stopDuration}>{stop.durationMin} min</Text>
              <Text style={styles.stopGas}>{stop.gasLabel}</Text>
            </View>
          ))}
        </ConfigSection>
      ) : (
        <View style={styles.ndlBanner}>
          <Text style={styles.ndlText}>✓  Plongée sans palier de décompression</Text>
        </View>
      )}

      <TouchableOpacity style={styles.launchBtn} onPress={launch} activeOpacity={0.85}>
        <Text style={styles.launchBtnTxt}>▶  Lancer le mode pédagogique</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch', gap: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  toggleTexts: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: '#E8E8E6' },
  toggleSub: { fontSize: 11, color: '#5F5E5A', marginTop: 2 },
  stopRow: {
    flexDirection: 'row', gap: 10, paddingVertical: 4,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  stopDepth: { fontSize: 13, fontWeight: '500', color: '#BA7517', width: 36 },
  stopDuration: { fontSize: 13, color: '#E8E8E6', width: 48 },
  stopGas: { fontSize: 12, color: '#5F5E5A' },
  ndlBanner: {
    backgroundColor: 'rgba(29,158,117,0.1)', borderRadius: 10, borderWidth: 0.5, borderColor: '#1D9E75',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  ndlText: { fontSize: 13, color: '#1D9E75' },
  launchBtn: { backgroundColor: '#185FA5', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  launchBtnTxt: { fontSize: 15, fontWeight: '500', color: '#E8F3FB' },
});
