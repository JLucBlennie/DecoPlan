import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gas } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

type GazCardProps = {
  gaz: Gas;
  onPress: () => void;
  onDelete: () => void;
};

function gazTypeStyle(gaz: Gas): { color: string; bg: string } {
  if (gaz.isTrimix) return { color: ocean.accent.purple, bg: ocean.soft.purple };
  if (gaz.isAir) return { color: ocean.accent.blue, bg: ocean.soft.blue };
  if (gaz.isNitrox) return { color: ocean.accent.teal, bg: ocean.soft.teal };
  return { color: ocean.text.secondary, bg: ocean.bg.raised };
}

function formatMod(gaz: Gas): string {
  try {
    const mod = Math.round(gaz.modInMeters(1.6, false));
    return `MOD ${mod}m`;
  } catch {
    return '';
  }
}

export default function GazCard({ gaz, onPress, onDelete }: GazCardProps) {
  const mod = formatMod(gaz);
  const { color, bg } = gazTypeStyle(gaz);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.cardName} numberOfLines={1}>{gaz.name}</Text>
          <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{gaz.shortLabel}</Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.metaValue}>O₂ {gaz.o2Percent}%</Text>
          {gaz.isTrimix && (
            <>
              <View style={styles.metaDot} />
              <Text style={styles.metaValue}>He {gaz.hePercent}%</Text>
            </>
          )}
          {mod !== '' && (
            <>
              <View style={styles.metaDot} />
              <View style={styles.metaChip}>
                <MaterialIcons name="arrow-downward" size={11} color={ocean.text.muted} />
                <Text style={styles.metaValue}>{mod}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="edit" size={18} color={ocean.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDelete]}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="delete" size={18} color={ocean.accent.red} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.md,
    borderRadius: radius.md, backgroundColor: ocean.bg.surface,
  },
  cardBody: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardName: { fontSize: fontSize.md, fontWeight: '500', color: ocean.text.primary, flexShrink: 1 },

  badge: {
    paddingHorizontal: spacing.xs, paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600', letterSpacing: 0.05 },

  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metaValue: { fontSize: fontSize.xs, color: ocean.text.secondary },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: ocean.border.subtle },

  cardActions: { flexDirection: 'row', gap: spacing.xs, marginLeft: spacing.sm },
  actionBtn: {
    width: 34, height: 34, borderRadius: radius.sm,
    backgroundColor: ocean.bg.raised, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnDelete: { backgroundColor: ocean.soft.red },
});