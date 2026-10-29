// components/SegmentedToggle.tsx
// Petit sélecteur à deux ou trois options (ex. « Détail » / « Et si ? »).
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fontSize, ocean, radius, spacing } from '../styles/theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
};

export default function SegmentedToggle<T extends string>({ value, options, onChange }: Props<T>) {
    return (
        <View style={styles.root}>
            {options.map(option => {
                const selected = option.value === value;
                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[styles.segment, selected && styles.segmentSelected]}
                        onPress={() => onChange(option.value)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                    >
                        <Text style={[styles.label, selected && styles.labelSelected]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        backgroundColor: ocean.bg.surface,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
        padding: 2,
        marginBottom: spacing.sm,
    },
    segment: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: radius.sm,
    },
    segmentSelected: { backgroundColor: ocean.bg.raised },
    label: { fontSize: fontSize.xs, color: ocean.text.muted },
    labelSelected: { color: ocean.text.primary, fontWeight: '600' },
});
