// components/WhatIfAccordion.tsx
// Les variantes « Et si ? » (+5 m, +5 min, 5 min au fond) dans une seule colonne :
// un en-tête par variante (durée totale + écart), un seul tableau ouvert à la fois.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMinutes, type WhatIfKind, type WhatIfRuntime } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import WhatIfRuntimeBody, { Delta } from './WhatIfRuntimeBody';

type Props = {
    runtimes: WhatIfRuntime[];
    /** Variante ouverte au départ (si elle fait partie de la liste). */
    defaultOpenKind?: WhatIfKind;
};

export default function WhatIfAccordion({ runtimes, defaultOpenKind }: Props) {
    const [openKind, setOpenKind] = useState<WhatIfKind | undefined>(
        runtimes.some(r => r.kind === defaultOpenKind) ? defaultOpenKind : undefined,
    );

    return (
        <View style={styles.root}>
            {runtimes.map(runtime => {
                const isOpen = runtime.kind === openKind;
                const { summary, delta } = runtime;
                return (
                    <View key={runtime.kind} style={styles.item}>
                        <Pressable
                            style={styles.header}
                            onPress={() => setOpenKind(isOpen ? undefined : runtime.kind)}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: isOpen }}
                        >
                            <View style={styles.headerText}>
                                <Text style={styles.title} numberOfLines={2}>{runtime.label}</Text>
                                <View style={styles.totalRow}>
                                    <Text style={styles.total}>{formatMinutes(summary.totalTimeMin)}'</Text>
                                    {delta && <Delta value={delta.totalTimeMin} unit="'" />}
                                </View>
                            </View>
                            <MaterialIcons
                                name={isOpen ? 'expand-less' : 'expand-more'}
                                size={22}
                                color={ocean.text.secondary}
                            />
                        </Pressable>
                        {isOpen && <WhatIfRuntimeBody runtime={runtime} />}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: spacing.xs },
    item: {
        backgroundColor: ocean.bg.surface,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        padding: spacing.sm,
        backgroundColor: ocean.bg.raised,
    },
    headerText: { flex: 1, gap: 2 },
    title: { fontSize: fontSize.xs, fontWeight: '600', color: ocean.text.secondary },
    totalRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
    total: { fontSize: fontSize.md, fontWeight: '600', color: ocean.text.primary },
});
