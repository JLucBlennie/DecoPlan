// components/WhatIfColumns.tsx
// Onglet « Et si ? » : trois colonnes fixes (côte à côte sur grand écran, empilées sur téléphone).
//   1. le runtime nominal ;
//   2. les variantes (+5 m, +5 min, 5 min au fond) dans un accordéon ;
//   3. les pertes de gaz : bail-out en recycleur, perte des gaz de déco en circuit ouvert.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { WhatIfKind, WhatIfResult } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import WhatIfAccordion from './WhatIfAccordion';
import WhatIfColumn from './WhatIfColumn';

type Props = { result: WhatIfResult };

/** À partir de cette largeur d'écran, les trois colonnes sont côte à côte. */
const WIDE_BREAKPOINT = 700;

const VARIANT_KINDS: readonly WhatIfKind[] = ['DEEPER', 'LONGER', 'SHORT_BOTTOM'];
const GAS_LOSS_KINDS: readonly WhatIfKind[] = ['BAILOUT', 'LOST_DECO_GAS'];

export default function WhatIfColumns({ result }: Props) {
    const { width: screenWidth } = useWindowDimensions();
    const isWide = screenWidth >= WIDE_BREAKPOINT;

    const variants = result.scenarios.filter(s => VARIANT_KINDS.includes(s.kind));
    const gasLoss = result.scenarios.find(s => GAS_LOSS_KINDS.includes(s.kind));
    // Scénario de la 3e colonne non calculable : sa raison s'affiche à sa place.
    const gasLossUnavailable = gasLoss
        ? undefined
        : result.unavailable.find(u => GAS_LOSS_KINDS.includes(u.kind));
    const otherUnavailable = result.unavailable.filter(u => u !== gasLossUnavailable);

    return (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.columns, isWide && styles.columnsWide]}>
                <View style={isWide ? styles.cell : undefined}>
                    <Text style={styles.sectionTitle}>Nominal</Text>
                    <WhatIfColumn runtime={result.nominal} isReference />
                </View>

                {variants.length > 0 && (
                    <View style={isWide ? styles.cell : undefined}>
                        <Text style={styles.sectionTitle}>Écarts</Text>
                        <WhatIfAccordion runtimes={variants} defaultOpenKind="LONGER" />
                    </View>
                )}

                {(gasLoss || gasLossUnavailable) && (
                    <View style={isWide ? styles.cell : undefined}>
                        <Text style={styles.sectionTitle}>Pertes de gaz</Text>
                        {gasLoss && <WhatIfColumn runtime={gasLoss} />}
                        {gasLossUnavailable && (
                            <View style={styles.unavailableCard}>
                                <Text style={styles.unavailableTitle}>{gasLossUnavailable.label}</Text>
                                <View style={styles.cardNote}>
                                    <MaterialIcons name="warning" size={12} color="#BA7517" />
                                    <Text style={[styles.noteTxt, { color: '#BA7517' }]}>
                                        {gasLossUnavailable.reason}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {otherUnavailable.map(u => (
                <View key={u.kind} style={styles.note}>
                    <MaterialIcons name="warning" size={12} color="#BA7517" />
                    <Text style={[styles.noteTxt, { color: '#BA7517' }]}>{u.label} : {u.reason}</Text>
                </View>
            ))}

            <View style={styles.note}>
                <MaterialIcons name="info-outline" size={12} color={ocean.text.muted} />
                <Text style={styles.noteTxt}>
                    Perte des gaz de déco : remontée sur le gaz de fond. Bail-out (recycleur) : passage en circuit ouvert en fin de fond, sur les gaz de déco ; consommation calculée avec le RMV déco et des blocs de 7 L / 200 bar. « Au fond » désigne le niveau
                    plat le plus profond, descente non comprise. Écarts calculés par rapport au nominal.
                    Calcul indicatif uniquement — non qualifié pour la plongée réelle.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    columns: { gap: spacing.md },
    columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
    cell: { flex: 1 },
    sectionTitle: {
        fontSize: 10, fontWeight: '600', color: ocean.text.muted,
        textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing.xs,
    },
    unavailableCard: {
        backgroundColor: ocean.bg.surface,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
        padding: spacing.sm, gap: spacing.xs,
    },
    unavailableTitle: { fontSize: fontSize.xs, fontWeight: '600', color: ocean.text.secondary },
    note: {
        flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
        paddingTop: spacing.sm, paddingBottom: spacing.xxl,
    },
    cardNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    noteTxt: { fontSize: 9, color: ocean.text.muted, flex: 1, lineHeight: 14 },
});
