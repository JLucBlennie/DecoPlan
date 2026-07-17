import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import {
  FlatList, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { calculProfondeurMax, calculTemps, Plongee } from '../lib/dive';
import { ROUTES } from '../navigation/types';
import { usePlongeeStore } from '../store/usePlongeeStore';
import { sharedStyles } from '../styles/sharedStyles';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

export default function GestionPlongee() {
  const router = useRouter();
  const { plongeeList, deletePlongee, resetPlongeeList } = usePlongeeStore();

  const handleEditPlongee = (plongee: Plongee) => {
    router.push({ pathname: ROUTES.EDIT_PLONGEE, params: { plongeeId: plongee.id } });
  };

  // ── Rendu d'une carte ─────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: Plongee }) => {
    const depth = calculProfondeurMax(item);
    const duration = calculTemps(item);
    const nbSegs = item.segments.length;
    const hasGaz = item.gazFond.length > 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleEditPlongee(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>

          <View style={styles.cardMeta}>
            <View style={styles.metaChip}>
              <MaterialIcons name="arrow-downward" size={11} color={ocean.accent.blue} />
              <Text style={styles.metaValue}>{depth} m</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaChip}>
              <MaterialIcons name="schedule" size={11} color={ocean.text.muted} />
              <Text style={styles.metaValue}>{duration} min</Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.metaMuted}>{nbSegs} segment{nbSegs > 1 ? 's' : ''}</Text>
            {hasGaz && (
              <>
                <View style={styles.metaDot} />
                <MaterialCommunityIcons name="diving-scuba-tank" size={12} color={ocean.accent.teal} />
              </>
            )}
            {item.gazDeco.length > 0 && (
              <MaterialCommunityIcons name="diving-scuba-tank-multiple" size={12} color={ocean.accent.purple} />
            )}
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEditPlongee(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="edit" size={18} color={ocean.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={() => deletePlongee(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="delete" size={18} color={ocean.accent.red} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const Separator = () => <View style={styles.separator} />;

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="diving-flippers" size={48} color={ocean.border.subtle} />
      <Text style={styles.emptyTitle}>Aucune plongée</Text>
      <Text style={styles.emptySubtitle}>Créez votre première plongée pour commencer.</Text>
    </View>
  );

  return (
    <SafeAreaView style={sharedStyles.screenContainer} edges={['top']}>
      <View style={sharedStyles.screenContent}>

        <View style={styles.header}>
          <Text style={sharedStyles.screenTitle}>Plongées</Text>
          {plongeeList.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeTxt}>{plongeeList.length}</Text>
            </View>
          )}
        </View>

        <FlatList
          style={styles.list}
          data={plongeeList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={plongeeList.length === 0 ? styles.listEmpty : undefined}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerBtnPrimary}
            onPress={() => router.push(ROUTES.ADD_PLONGEE)}
          >
            <MaterialIcons name="add" size={18} color={ocean.bg.deep} />
            <Text style={styles.footerBtnPrimaryTxt}>Ajouter une plongée</Text>
          </TouchableOpacity>

          {plongeeList.length > 0 && (
            <TouchableOpacity style={styles.footerBtnSecondary} onPress={resetPlongeeList}>
              <MaterialIcons name="clear" size={16} color={ocean.accent.red} />
              <Text style={styles.footerBtnSecondaryTxt}>Réinitialiser la liste</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, alignSelf: 'stretch', marginBottom: spacing.md,
  },
  countBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.full, backgroundColor: ocean.soft.blue,
  },
  countBadgeTxt: { fontSize: fontSize.xs, fontWeight: '600', color: ocean.accent.blue },

  list: { alignSelf: 'stretch', flex: 1 },
  listEmpty: { flex: 1 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ocean.border.muted, marginHorizontal: spacing.xs,
  },

  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.md,
    borderRadius: radius.md, backgroundColor: ocean.bg.surface,
  },
  cardBody: { flex: 1, gap: 4 },
  cardName: { fontSize: fontSize.md, fontWeight: '500', color: ocean.text.primary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metaValue: { fontSize: fontSize.xs, color: ocean.text.secondary },
  metaMuted: { fontSize: fontSize.xs, color: ocean.text.muted },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: ocean.border.subtle },

  cardActions: { flexDirection: 'row', gap: spacing.xs, marginLeft: spacing.sm },
  actionBtn: {
    width: 34, height: 34, borderRadius: radius.sm,
    backgroundColor: ocean.bg.raised, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnDelete: { backgroundColor: ocean.soft.red },

  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.xxl,
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '500', color: ocean.text.secondary, marginTop: spacing.sm },
  emptySubtitle: { fontSize: fontSize.sm, color: ocean.text.muted, textAlign: 'center', paddingHorizontal: spacing.xl },

  footer: {
    alignSelf: 'stretch', gap: spacing.sm, paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ocean.border.muted,
  },
  footerBtnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: ocean.accent.green,
    borderRadius: radius.md, paddingVertical: spacing.md,
  },
  footerBtnPrimaryTxt: { fontSize: fontSize.md, fontWeight: '600', color: ocean.bg.deep },
  footerBtnSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: ocean.soft.red,
    borderRadius: radius.md, paddingVertical: spacing.sm,
  },
  footerBtnSecondaryTxt: { fontSize: fontSize.sm, color: ocean.accent.red },
});
