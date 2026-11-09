// components/PrintRunSheetButton.tsx
// Bouton « Imprimer » : fiche A4 des runtimes (nominal + « Et si ? ») à plastifier.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

import type { RunSheetOptions, WhatIfResult } from '../lib/dive';
import { printRunSheet } from '../lib/print/printRunSheet';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

type Props = {
    result: WhatIfResult;
    options: Omit<RunSheetOptions, 'pageWidthPx'>;
};

export default function PrintRunSheetButton({ result, options }: Props) {
    const [busy, setBusy] = useState(false);

    async function handlePress() {
        if (busy) return;
        setBusy(true);
        try {
            await printRunSheet(result, options);
        } catch (error) {
            Alert.alert('Impression impossible', error instanceof Error ? error.message : String(error));
        } finally {
            setBusy(false);
        }
    }

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            disabled={busy}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Imprimer la fiche des runtimes"
        >
            {busy
                ? <ActivityIndicator size="small" color={ocean.accent.blue} />
                : <MaterialIcons name="print" size={16} color={ocean.accent.blue} />}
            <Text style={styles.label}>Imprimer</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.accent.blue,
        backgroundColor: ocean.bg.surface,
    },
    label: { fontSize: fontSize.xs, color: ocean.accent.blue, fontWeight: '600' },
});
