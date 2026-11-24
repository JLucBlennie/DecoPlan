// components/optimizer/GasBudgetList.tsx
// Par gaz : besoin, disponible (réserve déduite) et pression restante dans les blocs.
import { StyleSheet, Text, View } from 'react-native';

import type { GasBudget } from '../../lib/dive';
import { fontSize, ocean, spacing } from '../../styles/theme';

type Props = { budgets: GasBudget[]; reserves: { bottomBar: number; decoBar: number } };

export default function GasBudgetList({ budgets, reserves }: Props) {
    return (
        <View style={styles.root}>
            <Text style={styles.title}>Gaz : besoin / disponible</Text>
            {budgets.map(b => (
                <View key={`${b.role}-${b.gasName}`} style={styles.row}>
                    <Text style={styles.name}>{b.role === 'bottom' ? 'Fond' : 'Déco'} · {b.gasName}</Text>
                    <Text style={[styles.values, b.exceeded && styles.exceeded]}>
                        {Math.round(b.neededL)} / {Math.round(b.availableL)} L · reste {Math.round(b.remainingBar)} b
                    </Text>
                </View>
            ))}
            <Text style={styles.note}>
                Disponible = blocs × volume × (pression − réserve) ; réserve {reserves.bottomBar} b au fond, {reserves.decoBar} b en déco.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: 2, paddingVertical: spacing.xs },
    title: { fontSize: 9, fontWeight: '600', color: ocean.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
    name: { fontSize: fontSize.xs, color: ocean.accent.blue },
    values: { fontSize: fontSize.xs, color: ocean.text.primary },
    exceeded: { color: ocean.accent.red },
    note: { fontSize: 9, color: ocean.text.muted },
});
