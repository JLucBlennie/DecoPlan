import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useEditeur } from '../context/EditeurContext';
import { Gas } from '../lib/dive';
import { useGazStore } from '../store/useGazStore';
import { sharedStyles } from '../styles/sharedStyles';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import CircleButton from './ui/CircleButton';

type GazFormProps = {
    /**
     * Gaz à éditer. Toujours non-null ici : App.tsx n'affiche GazForm
     * que si selectedGaz !== null.
     */
    gaz: Gas | null;
    onClose: () => void;
};

export default function GazForm({ gaz, onClose }: GazFormProps) {
    const { fermerEditeur } = useEditeur();
    const { updateGaz } = useGazStore();

    const [nom, setNom] = useState(gaz ? gaz.name : '');
    const [o2, setO2] = useState(gaz ? (gaz.fO2 * 100).toFixed(0) : '');
    const [he, setHe] = useState(gaz ? (gaz.fHe * 100).toFixed(0) : '');
    const [err, setErr] = useState('');

    const closeEditeur = () => {
        fermerEditeur();
        onClose();
    };

    const handleSubmit = () => {
        const fO2 = parseFloat(o2) / 100;
        const fHe = parseFloat(he) / 100;

        if (!nom.trim()) { setErr('Le nom est obligatoire.'); return; }
        if (isNaN(fO2) || fO2 <= 0 || fO2 > 1) { setErr('O₂ doit être entre 1 et 100 %.'); return; }
        if (isNaN(fHe) || fHe < 0 || fHe > 1) { setErr('He doit être entre 0 et 100 %.'); return; }
        if (fO2 + fHe > 1) { setErr('O₂ + He ne peut pas dépasser 100 %.'); return; }

        setErr('');
        /**
         * On passe uniquement name / fO2 / fHe — le store reconstruit
         * une instance Gas propre en interne (avec fN2 calculé et méthodes).
         * Ne jamais passer fN2 ou une instance partielle ici.
         */
        updateGaz(gaz?.id || '', { name: nom.trim(), fO2, fHe });
        closeEditeur();
    };

    return (
        <View style={sharedStyles.screenContainer}>
            <Text style={sharedStyles.screenTitle}>Modifier le gaz</Text>

            {/* Nom */}
            <Text style={sharedStyles.sectionLabel}>Nom</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex : Tx21/35"
                placeholderTextColor={ocean.text.muted}
                value={nom}
                onChangeText={setNom}
                autoCapitalize="none"
            />

            {/* O₂ */}
            <Text style={sharedStyles.sectionLabel}>O₂ (%)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex : 21"
                placeholderTextColor={ocean.text.muted}
                value={o2}
                onChangeText={setO2}
                keyboardType="numeric"
            />

            {/* He */}
            <Text style={sharedStyles.sectionLabel}>He (%)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex : 35  (0 pour Nitrox ou Air)"
                placeholderTextColor={ocean.text.muted}
                value={he}
                onChangeText={setHe}
                keyboardType="numeric"
            />

            {/* fN2 calculé en lecture seule */}
            {!isNaN(parseFloat(o2)) && !isNaN(parseFloat(he)) && (
                <Text style={styles.n2Preview}>
                    N₂ calculé : {Math.max(0, 100 - parseFloat(o2) - parseFloat(he)).toFixed(0)} %
                </Text>
            )}

            {/* Erreur */}
            {err !== '' && <Text style={styles.errorTxt}>{err}</Text>}

            {/* Actions */}
            <View style={styles.buttons}>
                <CircleButton iconName="cancel" onPress={closeEditeur} position="Left" />
                <CircleButton iconName="check" onPress={handleSubmit} position="Right" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        alignSelf: 'stretch',
        backgroundColor: ocean.bg.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: fontSize.md,
        color: ocean.text.primary,
        marginBottom: spacing.sm,
    },
    n2Preview: {
        alignSelf: 'flex-start',
        fontSize: fontSize.xs,
        color: ocean.text.muted,
        marginBottom: spacing.sm,
    },
    errorTxt: {
        alignSelf: 'flex-start',
        fontSize: fontSize.sm,
        color: ocean.accent.red,
        marginBottom: spacing.sm,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignSelf: 'stretch',
        marginTop: spacing.lg,
    },
});