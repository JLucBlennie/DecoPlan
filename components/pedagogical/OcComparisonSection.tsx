// Réglage B « même plongée en circuit ouvert » (départ en CCR) : gaz de fond et de déco, GF.
import { StyleSheet, Switch, Text, View } from 'react-native';

import type { UsePedagogicalOcReturn } from '../../hooks/usePedagogicalOc';
import { GFSliderPair } from '../GFSliderPair';
import ConfigSection from './ConfigSection';
import GasChips from './GasChips';

const ACCENT = '#1D9E75';

type Props = { oc: UsePedagogicalOcReturn };

export default function OcComparisonSection({ oc }: Props) {
  const { state, error } = oc;

  return (
    <>
      <View style={styles.toggleRow}>
        <View style={styles.toggleTexts}>
          <Text style={styles.toggleLabel}>Comparer avec le circuit ouvert</Text>
          <Text style={styles.toggleSub}>Même profondeur / temps, gaz de fond et de déco au choix</Text>
        </View>
        <Switch
          value={state.enabled}
          onValueChange={oc.setEnabled}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(29,158,117,0.4)' }}
          thumbColor={state.enabled ? ACCENT : '#888780'}
        />
      </View>

      {state.enabled && (
        <ConfigSection label="Réglage B — circuit ouvert" badge="OC" badgeColor={ACCENT}>
          <Text style={styles.fieldLabel}>Gaz de fond (respirables sur cette plongée)</Text>
          {oc.bottomCandidates.length === 0
            ? <Text style={styles.error}>Aucun gaz de la liste n'est respirable à cette profondeur.</Text>
            : <GasChips gases={oc.bottomCandidates} selectedId={state.bottomGasId}
                onSelect={id => id && oc.setBottomGas(id)} accent={ACCENT} />}

          <Text style={styles.fieldLabel}>Gaz de déco (un seul, facultatif)</Text>
          <GasChips gases={oc.gases} selectedId={state.decoGasId} onSelect={oc.setDecoGas} allowNone accent={ACCENT} />

          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.fieldLabel}>GF circuit ouvert</Text>
          <GFSliderPair values={state.gf} onChange={oc.setGf} accentColor={ACCENT} />
        </ConfigSection>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  toggleTexts: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: '#E8E8E6' },
  toggleSub: { fontSize: 11, color: '#5F5E5A', marginTop: 2 },
  fieldLabel: { fontSize: 11, color: '#5F5E5A' },
  error: { fontSize: 12, color: '#E24B4A' },
});
