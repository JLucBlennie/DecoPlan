// Comparaison avec un 2ème réglage (réglage B), commune à l'écran de configuration
// et à la fenêtre de l'écran Calcul : interrupteur, choix du type de comparaison, réglages de B.
import { StyleSheet, Switch, Text, View } from 'react-native';

import type { UsePedagogicalCcrReturn } from '../../hooks/usePedagogicalCcr';
import type { UsePedagogicalOcReturn } from '../../hooks/usePedagogicalOc';
import { GFSliderPair, type GFValues } from '../GFSliderPair';
import SegmentedToggle from '../SegmentedToggle';
import CcrComparisonSection from './CcrComparisonSection';
import ConfigSection from './ConfigSection';
import OcComparisonSection from './OcComparisonSection';

type Kind = 'gf' | 'mode';

type Props = {
  showComparison: boolean;
  onToggle: () => void;
  gfB: GFValues;
  onGfB: (gf: GFValues) => void;
  ccr: UsePedagogicalCcrReturn;
  oc: UsePedagogicalOcReturn;
};

/** Vrai si le réglage B actif (CCR ou circuit ouvert) a une saisie invalide : lancement impossible. */
export function isComparisonBlocked(
  showComparison: boolean, ccr: UsePedagogicalCcrReturn, oc: UsePedagogicalOcReturn,
): boolean {
  if (!showComparison) return false;
  return (ccr.available && ccr.state.enabled && ccr.error !== null)
    || (oc.available && oc.state.enabled && oc.error !== null);
}

export default function ComparisonSettings({ showComparison, onToggle, gfB, onGfB, ccr, oc }: Props) {
  const modeLabel = ccr.available ? 'En recycleur (CCR)' : oc.available ? 'En circuit ouvert' : undefined;
  const modeEnabled = ccr.state.enabled || oc.state.enabled;
  const kind: Kind = modeEnabled ? 'mode' : 'gf';

  const handleToggle = () => {
    // Éteindre la comparaison remet aussi à zéro le type « autre mode de respiration ».
    if (showComparison) { ccr.setEnabled(false); oc.setEnabled(false); }
    onToggle();
  };

  const handleKind = (next: Kind) => {
    ccr.setEnabled(next === 'mode' && ccr.available);
    oc.setEnabled(next === 'mode' && oc.available);
  };

  return (
    <>
      <View style={styles.toggleRow}>
        <View style={styles.toggleTexts}>
          <Text style={styles.toggleLabel}>Comparer un 2ème réglage</Text>
          <Text style={styles.toggleSub}>Même profondeur / temps, côte à côte</Text>
        </View>
        <Switch
          value={showComparison}
          onValueChange={handleToggle}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(55,138,221,0.4)' }}
          thumbColor={showComparison ? '#378ADD' : '#888780'}
        />
      </View>

      {showComparison && modeLabel && (
        <SegmentedToggle
          value={kind}
          options={[
            { value: 'gf', label: 'Autres GF' },
            { value: 'mode', label: modeLabel },
          ]}
          onChange={handleKind}
        />
      )}

      {showComparison && kind === 'gf' && (
        <ConfigSection label="Réglage B" badge="GF alternatifs" badgeColor="#1D9E75">
          <GFSliderPair values={gfB} onChange={onGfB} accentColor="#1D9E75" />
        </ConfigSection>
      )}

      {showComparison && ccr.available && <CcrComparisonSection ccr={ccr} />}
      {showComparison && oc.available && <OcComparisonSection oc={oc} />}
    </>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  toggleTexts: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: '#E8E8E6' },
  toggleSub: { fontSize: 11, color: '#5F5E5A', marginTop: 2 },
});
