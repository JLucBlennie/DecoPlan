// Réglage B « même plongée en circuit ouvert » (départ en CCR) : gaz de fond et de déco, GF.
import { StyleSheet, Text, View } from 'react-native';

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
  fieldLabel: { fontSize: 11, color: '#5F5E5A' },
  error: { fontSize: 12, color: '#E24B4A' },
});
