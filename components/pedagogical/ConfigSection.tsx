// Bloc titré (libellé + badge) des écrans de configuration du mode pédagogique.
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { label: string; badge?: string; badgeColor?: string; children: ReactNode };

export default function ConfigSection({ label, badge, badgeColor = '#5F5E5A', children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badgeColor + '22' }]}>
            <Text style={[styles.badgeTxt, { color: badgeColor }]}>{badge}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', padding: 14, gap: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, fontWeight: '500', color: '#E8E8E6' },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  badgeTxt: { fontSize: 10 },
});
