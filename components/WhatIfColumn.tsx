// components/WhatIfColumn.tsx
// Une colonne = un runtime (nominal ou scénario) : en-tête (libellé, durée, écart) puis corps.
import { StyleSheet, Text, View } from 'react-native';

import { formatMinutes, type WhatIfRuntime } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import WhatIfRuntimeBody, { Delta } from './WhatIfRuntimeBody';

type Props = {
    runtime: WhatIfRuntime;
    /** Largeur fixe ; sans elle, la colonne remplit l'espace disponible. */
    width?: number;
    /** Vrai pour le nominal : colonne de référence, sans écarts. */
    isReference?: boolean;
};

export default function WhatIfColumn({ runtime, width, isReference = false }: Props) {
    const { summary, delta } = runtime;

    return (
        <View style={[styles.column, width !== undefined ? { width } : styles.fill, isReference && styles.reference]}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>{runtime.label}</Text>
                <View style={styles.totalRow}>
                    <Text style={styles.total}>{formatMinutes(summary.totalTimeMin)}'</Text>
                    {delta && <Delta value={delta.totalTimeMin} unit="'" />}
                </View>
            </View>
            <WhatIfRuntimeBody runtime={runtime} />
        </View>
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
