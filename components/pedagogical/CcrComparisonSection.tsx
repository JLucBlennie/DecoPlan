// Réglage B « même plongée en recycleur » : diluant saisi librement, GF CCR.
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import type { UsePedagogicalCcrReturn } from '../../hooks/usePedagogicalCcr';
import { GFSliderPair } from '../GFSliderPair';
import ConfigSection from './ConfigSection';

const ACCENT = '#1D9E75';

type Props = { ccr: UsePedagogicalCcrReturn };

export default function CcrComparisonSection({ ccr }: Props) {
  const { state, error } = ccr;

  return (
    <>
      <View style={styles.toggleRow}>
        <View style={styles.toggleTexts}>
          <Text style={styles.toggleLabel}>Comparer avec un recycleur (CCR)</Text>
          <Text style={styles.toggleSub}>Même profondeur / temps, diluant au choix, sans bail-out</Text>
        </View>
        <Switch
          value={state.enabled}
          onValueChange={ccr.setEnabled}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(29,158,117,0.4)' }}
          thumbColor={state.enabled ? ACCENT : '#888780'}
        />
      </View>

      {state.enabled && (
        <ConfigSection label="Réglage B — recycleur" badge="CCR" badgeColor={ACCENT}>
          <Text style={styles.fieldLabel}>Diluant</Text>
          <View style={styles.diluentRow}>
            <PercentInput label="O₂" value={state.diluentO2Pct}
              onChange={v => ccr.setDiluent(v, state.diluentHePct)} />
            <PercentInput label="He" value={state.diluentHePct}
              onChange={v => ccr.setDiluent(state.diluentO2Pct, v)} />
          </View>
          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.fieldLabel}>GF recycleur</Text>
          <GFSliderPair values={state.gf} onChange={ccr.setGf} accentColor={ACCENT} />
        </ConfigSection>
      )}
    </>
  );
}

function PercentInput({ label, value, onChange }: {
  label: string; value: string; onChange: (value: string) => void;
}) {
  return (
    <View style={styles.inputBox}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        maxLength={3}
        selectTextOnFocus
      />
      <Text style={styles.inputUnit}>%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  toggleTexts: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: '#E8E8E6' },
  toggleSub: { fontSize: 11, color: '#5F5E5A', marginTop: 2 },
  fieldLabel: { fontSize: 11, color: '#5F5E5A' },
  diluentRow: { flexDirection: 'row', gap: 12 },
  inputBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inputLabel: { fontSize: 13, color: '#E8E8E6', width: 22 },
  input: {
    minWidth: 56, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)', color: '#E8E8E6', fontSize: 14, textAlign: 'center',
  },
  inputUnit: { fontSize: 12, color: '#5F5E5A' },
  error: { fontSize: 12, color: '#E24B4A' },
});
