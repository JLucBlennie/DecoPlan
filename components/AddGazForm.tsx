import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { Gas } from '../lib/dive';
import { useGazStore } from '../store/useGazStore';
import { sharedStyles } from '../styles/sharedStyles';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

export default function AddGazForm() {
    const { addGaz } = useGazStore();

    const [nom, setNom] = useState('');
    const [o2, setO2] = useState('21');
    const [he, setHe] = useState('0');
    const [err, setErr] = useState('');

    const handleSubmit = () => {
        const fO2 = parseFloat(o2) / 100;
        const fHe = parseFloat(he) / 100;

        if (!nom.trim()) { setErr('Le nom est obligatoire.'); return; }
        if (isNaN(fO2) || fO2 <= 0 || fO2 > 1) { setErr('O₂ doit être entre 1 et 100 %.'); return; }
        if (isNaN(fHe) || fHe < 0 || fHe > 1) { setErr('He doit être entre 0 et 100 %.'); return; }
        if (fO2 + fHe > 1) { setErr('O₂ + He ne peut pas dépasser 100 %.'); return; }

        setErr('');
        addGaz(Gas.create(nom.trim(), fO2, fHe));
        router.back();
    };

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={sharedStyles.screenTitle}>Ajouter un gaz</Text>

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
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <MaterialIcons name="add" size={18} color={ocean.bg.deep} />
                <Text style={styles.submitBtnTxt}>Ajouter le gaz</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
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
        justifyContent: 'flex-end',
        marginTop: spacing.md,
    },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: spacing.sm, backgroundColor: ocean.accent.green,
        borderRadius: radius.md, paddingVertical: spacing.md,
        marginTop: spacing.md,
    },
    submitBtnTxt: { fontSize: fontSize.md, fontWeight: '600', color: ocean.bg.deep },
})