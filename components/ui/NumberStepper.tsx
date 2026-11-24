// components/ui/NumberStepper.tsx
// Champ numérique avec boutons − / + ; la saisie est validée (bornes) à la fin de l'édition.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { fontSize, ocean, radius, spacing } from '../../styles/theme';

type Props = {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
};

export default function NumberStepper({ label, value, min, max, step = 1, unit, onChange }: Props) {
    const [text, setText] = useState(String(value));
    useEffect(() => setText(String(value)), [value]);

    const clamp = (v: number) => Math.min(max, Math.max(min, v));
    const commit = () => {
        const parsed = parseFloat(text.replace(',', '.'));
        if (Number.isNaN(parsed)) setText(String(value));
        else onChange(clamp(parsed));
    };

    return (
        <View style={styles.root}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.controls}>
                <TouchableOpacity style={styles.btn} onPress={() => onChange(clamp(value - step))} accessibilityLabel={`${label} moins`}>
                    <Text style={styles.btnTxt}>−</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    onBlur={commit}
                    onSubmitEditing={commit}
                    keyboardType="numeric"
                    selectTextOnFocus
                />
                {unit && <Text style={styles.unit}>{unit}</Text>}
                <TouchableOpacity style={styles.btn} onPress={() => onChange(clamp(value + step))} accessibilityLabel={`${label} plus`}>
                    <Text style={styles.btnTxt}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    label: { fontSize: fontSize.sm, color: ocean.text.secondary, flexShrink: 1 },
    controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    btn: {
        width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center',
        backgroundColor: ocean.bg.surface, borderWidth: 0.5, borderColor: ocean.border.subtle,
    },
    btnTxt: { fontSize: fontSize.md, color: ocean.text.primary },
    input: {
        minWidth: 54, textAlign: 'center', fontSize: fontSize.sm, color: ocean.text.primary,
        borderBottomWidth: 1, borderBottomColor: ocean.border.subtle, paddingVertical: 2,
    },
    unit: { fontSize: fontSize.xs, color: ocean.text.muted },
});
