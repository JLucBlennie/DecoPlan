import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Gas } from '../lib/dive';
import { ROUTES } from '../navigation/types';
import { useGazStore } from '../store/useGazStore';
import { sharedStyles } from '../styles/sharedStyles';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import GazCard from './GazCard';

export default function GestionGaz() {
    const router = useRouter();
    const { gazList, deleteGaz, resetGazList } = useGazStore();

    const handleEditGaz = (gaz: Gas) => {
        router.push({ pathname: ROUTES.EDIT_GAZ, params: { gazId: gaz.id } });
    };

    const Separator = () => <View style={styles.separator} />;

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="diving-scuba-tank" size={48} color={ocean.border.subtle} />
            <Text style={styles.emptyTitle}>Aucun gaz</Text>
            <Text style={styles.emptySubtitle}>Créez votre premier gaz pour commencer.</Text>
        </View>
    );

    return (
        <SafeAreaView style={sharedStyles.screenContainer} edges={['top']}>
            <View style={sharedStyles.screenContent}>

                <View style={styles.header}>
                    <Text style={sharedStyles.screenTitle}>Gaz</Text>
                    {gazList.length > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeTxt}>{gazList.length}</Text>
                        </View>
                    )}
                </View>

                <FlatList
                    style={styles.list}
                    data={gazList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <GazCard gaz={item} onPress={() => handleEditGaz(item)} onDelete={() => deleteGaz(item.id)} />
                    )}
                    ItemSeparatorComponent={Separator}
                    ListEmptyComponent={EmptyState}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={gazList.length === 0 ? styles.listEmpty : undefined}
                />

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.footerBtnPrimary}
                        onPress={() => router.push(ROUTES.ADD_GAZ)}
                    >
                        <MaterialIcons name="add" size={18} color={ocean.bg.deep} />
                        <Text style={styles.footerBtnPrimaryTxt}>Ajouter un gaz</Text>
                    </TouchableOpacity>

                    {gazList.length > 0 && (
                        <TouchableOpacity style={styles.footerBtnSecondary} onPress={resetGazList}>
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