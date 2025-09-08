import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useGazStore } from '../store/useGazStore';
import { Dive } from '../lib/dive/dive';
import CircleButton from './ui/CircleButton';

type GazFormProps = {
    gaz: Dive.Gas;
    onClose: () => void;
};

export default function GazForm({ gaz, onClose }: GazFormProps) {
    const { updateGaz } = useGazStore();
    const [nom, setNom] = useState(gaz.name);
    const [o2, setO2] = useState((gaz.fO2 * 100).toString());
    const [he, setHe] = useState((gaz.fHe * 100).toString());

    const handleSubmit = () => {
        if (!nom || !o2 || !he) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        updateGaz(gaz.id, { name: nom, fO2: parseFloat(o2) / 100, fHe: parseFloat(he) / 100, fN2: 1 - (parseFloat(o2) / 100 + parseFloat(he) / 100) });
        onClose();
    };

    return (
        <View style={styles.form}>
            <Text style={styles.title}>Modifier le Gaz</Text>
            <View style={styles.textInput}>
                <Text style={styles.labelInput}>Nom :</Text>
                <TextInput
                    placeholder="Nom"
                    value={nom}
                    onChangeText={setNom}
                    style={styles.input}
                />
            </View>
            <View style={styles.textInput}>
                <Text style={styles.labelInput}>Nom :</Text>
                <TextInput
                    placeholder="O2 (%)"
                    value={o2}
                    onChangeText={setO2}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
            <View style={styles.textInput}>
                <Text style={styles.labelInput}>Nom :</Text>
                <TextInput
                    placeholder="He (%)"
                    value={he}
                    onChangeText={setHe}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
            <View style={styles.buttons}>
                <CircleButton iconName="cancel" onPress={onClose} position='Left' />
                <CircleButton iconName="check" onPress={handleSubmit} position='Right' />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    form: {
        padding: 16
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16
    },
    input: {
        flex: 3 / 4,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginBottom: 8
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    textInput: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelInput: {
        flex: 1 / 4,
        padding: 8,
        marginBottom: 8
    }
});
