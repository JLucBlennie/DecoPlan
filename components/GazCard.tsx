import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gas } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type GazCardProps = {
  gaz: Gas;
  onPress: () => void;
  onDelete: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Détermine le type de gaz et renvoie label + couleurs associées */
function gazType(gaz: Gas): { label: string; color: string; bg: string } {
  const o2 = Math.round(gaz.fO2 * 100);
  const he = Math.round(gaz.fHe * 100);

  if (he > 0) return { label: 'TRIMIX', color: ocean.accent.purple, bg: ocean.soft.purple };
  if (o2 === 21) return { label: 'AIR', color: ocean.accent.blue, bg: ocean.soft.blue };
  if (o2 > 21) return { label: 'NITROX', color: ocean.accent.teal, bg: ocean.soft.teal };
  return { label: 'GAZ', color: ocean.text.secondary, bg: ocean.bg.raised };
}

/** Formate la MOD à partir de la fonction déjà présente sur Dive.Gas */
function formatMod(gaz: Gas): string {
  try {
    const mod = Math.round(gaz.modInMeters(1.6, false));
    return `MOD ${mod}m`;
  } catch {
    return '';
  }
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function GazCard({ gaz, onPress, onDelete }: GazCardProps) {
  const o2 = Math.round(gaz.fO2 * 100);
  const he = Math.round(gaz.fHe * 100);
  const mod = formatMod(gaz);
  const { label, color, bg } = gazType(gaz);

  return (
    <View style={styles.card}>

      {/* Badge type de gaz */}
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
      </View>

      {/* Infos principales */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{gaz.name}</Text>
        <Text style={styles.sub}>
          O₂ {o2}%{he > 0 ? ` · He ${he}%` : ''}{mod ? ` · ${mod}` : ''}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Modifier ${gaz.name}`}
        >
          <MaterialIcons name="edit" size={18} color={ocean.accent.blue} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnDelete, pressed && styles.actionBtnPressed]}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Supprimer ${gaz.name}`}
        >
          <MaterialIcons name="delete-outline" size={18} color={ocean.accent.red} />
        </Pressable>
      </View>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ocean.bg.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ocean.border.subtle,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },

  // Badge type
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.05,
  },

  // Infos
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: ocean.text.primary,
  },
  sub: {
    fontSize: fontSize.xs,
    color: ocean.text.secondary,
  },

  // Boutons d'action
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: ocean.bg.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ocean.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDelete: {
    borderColor: ocean.soft.red,
    backgroundColor: ocean.soft.red,
  },
  actionBtnPressed: {
    opacity: 0.7,
  },
});
