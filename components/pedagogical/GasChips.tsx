// Choix d'un gaz dans une liste, sous forme de pastilles (avec option « aucun » facultative).
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { Gas } from '../../lib/dive/gas';

type Props = {
  gases: Gas[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
  /** Ajoute une pastille « Aucun » (sélection `undefined`). */
  allowNone?: boolean;
  accent: string;
};

export default function GasChips({ gases, selectedId, onSelect, allowNone = false, accent }: Props) {
  return (
    <View style={styles.row}>
      {allowNone && (
        <Chip label="Aucun" active={selectedId === undefined} accent={accent} onPress={() => onSelect(undefined)} />
      )}
      {gases.map(g => (
        <Chip key={g.id} label={g.name} active={g.id === selectedId} accent={accent} onPress={() => onSelect(g.id)} />
      ))}
    </View>
  );
}

function Chip({ label, active, accent, onPress }: {
  label: string; active: boolean; accent: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && { backgroundColor: accent, borderColor: accent }]}
    >
      <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipTxt: { fontSize: 12, color: '#E8E8E6' },
  chipTxtActive: { color: '#0A0F1E', fontWeight: '600' },
});
