// components/PlongeePicker.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
    ScrollView, StyleSheet, Text,
    TouchableOpacity, View,
} from 'react-native';

import { calculProfondeurMax, calculTemps, Plongee } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

type PlongeePickerProps = {
    plongees: Plongee[];
    selectedId: string | null;
    onSelect: (plongeeId: string) => void;
};

export default function PlongeePicker({
    plongees, selectedId, onSelect,
}: PlongeePickerProps) {

    const [expanded, setExpanded] = useState(false);

    const selected = plongees.find(p => p.id === selectedId) ?? null;

    // ── État vide ─────────────────────────────────────────────────────────────
    if (plongees.length === 0) {
        return (
            <View style={styles.empty}>
                <MaterialCommunityIcons name="diving-flippers" size={20} color={ocean.text.muted} />
                <Text style={styles.emptyTxt}>Aucune plongée — créez-en une d'abord.</Text>
            </View>
        );
    }

    // ── Sélection faite, liste repliée ────────────────────────────────────────
    return (
        <View>
            {/* Champ "trigger" — affiche la plongée sélectionnée ou le placeholder */}
            <TouchableOpacity
                style={[styles.trigger, expanded && styles.triggerOpen]}
                onPress={() => setExpanded(e => !e)}
                activeOpacity={0.8}
            >
                {selected ? (
                    <View style={styles.triggerSelected}>
                        <MaterialCommunityIcons
                            name="diving-scuba-tank"
                            size={16}
                            color={ocean.accent.blue}
                        />
                        <View style={styles.triggerInfo}>
                            <Text style={styles.triggerName}>{selected.name}</Text>
                            <Text style={styles.triggerMeta}>
                                {calculProfondeurMax(selected)} m · {calculTemps(selected)} min
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.placeholder}>Sélectionnez une plongée…</Text>
                )}
                <MaterialIcons
                    name={expanded ? 'expand-less' : 'expand-more'}
                    size={20}
                    color={ocean.text.secondary}
                />
            </TouchableOpacity>

            {/* Liste déroulante inline — pas de z-index, pas de Modal */}
            {expanded && (
                <View style={styles.list}>
                    <ScrollView
                        style={styles.listScroll}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                    >
                        {plongees.map((plongee, index) => {
                            const isSelected = plongee.id === selectedId;
                            const depth = calculProfondeurMax(plongee);
                            const duration = calculTemps(plongee);

                            return (
                                <TouchableOpacity
                                    key={plongee.id}
                                    style={[
                                        styles.item,
                                        isSelected && styles.itemSelected,
                                        index === 0 && styles.itemFirst,
                                    ]}
                                    onPress={() => {
                                        onSelect(plongee.id);
                                        setExpanded(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    {/* Indicateur de sélection */}
                                    <MaterialIcons
                                        name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                                        size={18}
                                        color={isSelected ? ocean.accent.blue : ocean.border.subtle}
                                    />

                                    {/* Infos */}
                                    <View style={styles.itemInfo}>
                                        <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
                                            {plongee.name}
                                        </Text>
                                        <View style={styles.itemMeta}>
                                            <MaterialIcons name="arrow-downward" size={10} color={ocean.text.muted} />
                                            <Text style={styles.itemMetaTxt}>{depth} m</Text>
                                            <Text style={styles.itemMetaDot}>·</Text>
                                            <MaterialIcons name="schedule" size={10} color={ocean.text.muted} />
                                            <Text style={styles.itemMetaTxt}>{duration} min</Text>
                                            {plongee.segments.length > 0 && (
                                                <>
                                                    <Text style={styles.itemMetaDot}>·</Text>
                                                    <Text style={styles.itemMetaTxt}>
                                                        {plongee.segments.length} seg.
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {/* Badge gaz */}
                                    <View style={styles.gasBadges}>
                                        {plongee.gazFond.length > 0 && (
                                            <View style={styles.gasBadge}>
                                                <Text style={styles.gasBadgeTxt}>
                                                    {plongee.gazFond.length} fond
                                                </Text>
                                            </View>
                                        )}
                                        {plongee.gazDeco.length > 0 && (
                                            <View style={[styles.gasBadge, styles.gasBadgeDeco]}>
                                                <Text style={[styles.gasBadgeTxt, styles.gasBadgeDecoTxt]}>
                                                    {plongee.gazDeco.length} déco
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // ── Trigger ───────────────────────────────────────────────────────────────
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: ocean.bg.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 48,
    },
    triggerOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderColor: ocean.accent.blue,
    },
    triggerSelected: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1,
    },
    triggerInfo: { flex: 1 },
    triggerName: {
        fontSize: fontSize.md, fontWeight: '500', color: ocean.text.primary,
    },
    triggerMeta: {
        fontSize: fontSize.xs, color: ocean.text.muted, marginTop: 1,
    },
    placeholder: {
        fontSize: fontSize.md, color: ocean.text.muted, flex: 1,
    },

    // ── Liste inline ──────────────────────────────────────────────────────────
    list: {
        backgroundColor: ocean.bg.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderTopWidth: 0,
        borderColor: ocean.accent.blue,
        borderBottomLeftRadius: radius.md,
        borderBottomRightRadius: radius.md,
        overflow: 'hidden',
    },
    listScroll: { maxHeight: 260 },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: ocean.border.subtle,
    },
    itemFirst: { borderTopWidth: 0 },
    itemSelected: { backgroundColor: 'rgba(55,138,221,0.08)' },

    itemInfo: { flex: 1 },
    itemName: { fontSize: fontSize.sm, color: ocean.text.secondary },
    itemNameSelected: { color: ocean.text.primary, fontWeight: '500' },
    itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    itemMetaTxt: { fontSize: fontSize.xs, color: ocean.text.muted },
    itemMetaDot: { fontSize: fontSize.xs, color: ocean.border.subtle },

    gasBadges: { flexDirection: 'row', gap: 3 },
    gasBadge: {
        paddingHorizontal: 5, paddingVertical: 2, borderRadius: radius.full,
        backgroundColor: ocean.soft.blue,
    },
    gasBadgeTxt: { fontSize: 9, color: ocean.accent.blue },
    gasBadgeDeco: { backgroundColor: 'rgba(29,158,117,0.12)' },
    gasBadgeDecoTxt: { color: ocean.accent.teal },

    // ── État vide ─────────────────────────────────────────────────────────────
    empty: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        padding: spacing.md,
        backgroundColor: ocean.bg.surface,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
    },
    emptyTxt: { fontSize: fontSize.sm, color: ocean.text.muted, flex: 1 },
});