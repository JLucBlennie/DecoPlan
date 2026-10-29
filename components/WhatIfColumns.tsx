// components/WhatIfColumns.tsx
// Le runtime nominal (fixe, à gauche) à côté des scénarios « Et si ? » (défilement horizontal).
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { WhatIfResult } from '../lib/dive';
import { ocean, spacing } from '../styles/theme';
import WhatIfColumn from './WhatIfColumn';

type Props = { result: WhatIfResult };

/** Largeur minimale d'une colonne : en dessous, les scénarios défilent. */
const MIN_COLUMN_WIDTH = 150;

export default function WhatIfColumns({ result }: Props) {
    const { width: screenWidth } = useWindowDimensions();

    // Sur grand écran, les colonnes se partagent la largeur (marges d'écran et espaces
    // entre colonnes déduits) ; sur téléphone, elles gardent MIN_COLUMN_WIDTH et défilent.
    const columnCount = 1 + result.scenarios.length;
    const availableWidth = screenWidth - 2 * spacing.md - (columnCount - 1) * spacing.xs;
    const columnWidth = Math.max(MIN_COLUMN_WIDTH, Math.floor(availableWidth / columnCount));

    return (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.columns}>
                <WhatIfColumn runtime={result.nominal} width={columnWidth} isReference />

                <ScrollView
                    horizontal
                    style={styles.scenarioScroll}
                    contentContainerStyle={styles.scenarios}
                    showsHorizontalScrollIndicator={false}
                >
                    {result.scenarios.map(scenario => (
                        <WhatIfColumn key={scenario.kind} runtime={scenario} width={columnWidth} />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.note}>
                <MaterialIcons name="info-outline" size={12} color={ocean.text.muted} />
                <Text style={styles.noteTxt}>
                    Perte des gaz de déco : remontée sur le gaz de fond. « Au fond » désigne le niveau
                    plat le plus profond, descente non comprise. Écarts calculés par rapport au nominal.
                    Calcul indicatif uniquement — non qualifié pour la plongée réelle.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    scenarioScroll: { flex: 1 },
    scenarios: { gap: spacing.xs },
    note: {
        flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
        paddingTop: spacing.sm, paddingBottom: spacing.xxl,
    },
    noteTxt: { fontSize: 9, color: ocean.text.muted, flex: 1, lineHeight: 14 },
});
