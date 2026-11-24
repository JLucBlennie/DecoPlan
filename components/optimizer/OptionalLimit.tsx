// components/optimizer/OptionalLimit.tsx
// Limite facultative : case à cocher + valeur. Décochée, la limite n'est pas appliquée.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fontSize, ocean, spacing } from '../../styles/theme';
import NumberStepper from '../ui/NumberStepper';

type Props = {
    label: string;
    unit: string;
    /** `undefined` = limite désactivée. */
    value: number | undefined;
    defaultValue: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number | undefined) => void;
};

export default function OptionalLimit({ label, unit, value, defaultValue, min, max, step, onChange }: Props) {
    const enabled = value !== undefined;
    return (
        <View style={styles.root}>
            <TouchableOpacity style={styles.toggle} onPress={() => onChange(enabled ? undefined : defaultValue)}>
                <MaterialIcons name={enabled ? 'check-box' : 'check-box-outline-blank'} size={20}
                    color={enabled ? ocean.accent.blue : ocean.border.subtle} />
                <Text style={styles.label}>{label}</Text>
            </TouchableOpacity>
            {enabled && (
                <NumberStepper label="Maximum" value={value} min={min} max={max} step={step} unit={unit} onChange={onChange} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: spacing.xs },
    toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    label: { fontSize: fontSize.sm, color: ocean.text.primary },
});
