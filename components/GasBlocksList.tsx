// components/GasBlocksList.tsx
// Gaz nécessaire par gaz (litres détendus) et blocs conseillés pour aller au bout du runtime.
import { StyleSheet, Text, View } from 'react-native';

import { formatSuggestion, type RuntimeGasNeed, type RuntimeGasRole } from '../lib/dive';
import { fontSize, ocean, spacing } from '../styles/theme';

type Props = { needs: RuntimeGasNeed[] };

const ROLE_LABEL: Record<RuntimeGasRole, string> = { bottom: 'Fond', deco: 'Déco', bailout: 'Bail-out' };

export default function GasBlocksList({ needs }: Props) {
    if (needs.length === 0) return null;
    return (
        <View style={styles.root}>
            <Text style={styles.title}>Gaz nécessaire</Text>
            {needs.map(need => (
                <View key={`${need.role}-${need.gasName}`} style={styles.item}>
                    <View style={styles.headRow}>
                        <Text style={styles.gasName} numberOfLines={1}>
                            {ROLE_LABEL[need.role]} · {need.gasName}
                        </Text>
                        <Text style={styles.litres}>{Math.round(need.litres)} L</Text>
                    </View>
                    {need.options.map(option => (
                        <Text
                            key={`${option.block.volumeL}-${option.block.pressureBar}`}
                            style={[styles.option, option === need.best && need.options.length > 1 && styles.optionBest]}
                        >
                            {formatSuggestion(option)}
                            {option === need.best && need.options.length > 1 ? '  ← optimal' : ''}
                        </Text>
                    ))}
                </View>
            ))}
            <Text style={styles.note}>
                Litres détendus, sans réserve. Blocs : fond 12 ou 15 L/230 b, déco 7 L/200 b, bail-out 7 L/200 b ou 11 L/200 b.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, gap: spacing.xs },
    title: {
        fontSize: 9, fontWeight: '600', color: ocean.text.muted,
        textTransform: 'uppercase', letterSpacing: 0.4,
    },
    item: { gap: 1 },
    headRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
    gasName: { fontSize: 10, color: ocean.accent.blue, flexShrink: 1 },
    litres: { fontSize: 10, color: ocean.text.primary },
    option: { fontSize: fontSize.xs, color: ocean.text.secondary, paddingLeft: spacing.sm },
    optionBest: { color: ocean.accent.teal, fontWeight: '600' },
    note: { fontSize: 9, color: ocean.text.muted },
});
