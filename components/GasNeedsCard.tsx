// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — GasNeedsCard
// Volume de gaz nécessaire (litres détendus) pour faire la plongée en circuit ouvert.
// ─────────────────────────────────────────────────────────────────────────────
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import type { GasNeed } from '../lib/dive/types';

const ROLE_LABEL: Record<string, string> = { bottom: 'Fond', deco: 'Déco', diluent: 'Diluant' };

export function GasNeedsCard({ needs, style }: { needs: GasNeed[]; style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>Gaz nécessaire en circuit ouvert</Text>
      {needs.map(n => (
        <View key={n.gasId} style={styles.row}>
          <Text style={styles.role}>{ROLE_LABEL[n.role] ?? n.role}</Text>
          <Text style={styles.label} numberOfLines={1}>{n.label}</Text>
          <Text style={styles.litres}>{Math.round(n.litres)} L</Text>
        </View>
      ))}
      <Text style={styles.note}>Litres détendus, calculés avec les RMV fond et déco des préférences.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)', padding: 12, gap: 6,
  },
  title: { fontSize: 11, fontWeight: '500', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  role: { fontSize: 11, color: '#5F5E5A', width: 44 },
  label: { flex: 1, fontSize: 13, color: '#E8E8E6' },
  litres: { fontSize: 15, fontWeight: '500', color: '#85B7EB' },
  note: { fontSize: 10, color: '#5F5E5A' },
});
