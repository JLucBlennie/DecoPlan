// components/WhatIfColumn.tsx
// Une colonne = un runtime (nominal ou scénario) : en-tête (libellé, durée, écart) puis corps.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMinutes, type WhatIfRuntime } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import WhatIfRuntimeBody, { Delta } from './WhatIfRuntimeBody';
import { SERIES_COLORS } from './whatIfChartSeries';

type Props = {
    runtime: WhatIfRuntime;
    /** Largeur fixe ; sans elle, la colonne remplit l'espace disponible. */
    width?: number;
    /** Vrai pour le nominal : colonne de référence, sans écarts. */
    isReference?: boolean;
    /** Runtime mis en évidence dans le graphique : la colonne prend la couleur de son profil. */
    selected?: boolean;
    /** Toucher la colonne (en-tête ou tableau) la sélectionne. */
    onSelect?: () => void;
};

export default function WhatIfColumn({ runtime, width, isReference = false, selected = false, onSelect }: Props) {
    const { summary, delta } = runtime;

    return (
        <Pressable
            style={[
                styles.column, width !== undefined ? { width } : styles.fill, isReference && styles.reference,
                selected && { borderColor: SERIES_COLORS[runtime.kind], borderWidth: 1.5 },
            ]}
            onPress={onSelect}
            disabled={!onSelect}
            accessibilityRole="button"
            accessibilityState={{ selected }}
        >
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>{runtime.label}</Text>
                <View style={styles.totalRow}>
                    <Text style={styles.total}>{formatMinutes(summary.totalTimeMin)}'</Text>
                    {delta && <Delta value={delta.totalTimeMin} unit="'" />}
                </View>
            </View>
            <WhatIfRuntimeBody runtime={runtime} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    column: {
        backgroundColor: ocean.bg.surface,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
        overflow: 'hidden',
    },
    fill: { flex: 1 },
    reference: { borderColor: ocean.accent.blue },

    header: {
        padding: spacing.sm,
        gap: 2,
        backgroundColor: ocean.bg.raised,
    },
    title: { fontSize: fontSize.xs, fontWeight: '600', color: ocean.text.secondary, minHeight: 28 },
    totalRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
    total: { fontSize: fontSize.md, fontWeight: '600', color: ocean.text.primary },
});
