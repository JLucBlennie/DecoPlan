import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useGazStore } from '../store/useGazStore';
import { Dive } from '../lib/dive/dive';

type GazFormProps = {
    onClose: () => void;
};

export default function AddGazForm({ onClose }: GazFormProps) {
    const { addGaz } = useGazStore();
    const [nom, setNom] = useState("");
    const [o2, setO2] = useState("21");
    const [he, setHe] = useState("0");

    const handleSubmit = () => {
        if (!nom || !o2 || !he) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        addGaz(Dive.gas(nom, parseFloat(o2) / 100, parseFloat(he) / 100));
        onClose();
    };

    return (
        <View style={styles.form}>
            <Text style={styles.title}>Modifier le Gaz</Text>
            <TextInput
                placeholder="Nom"
                value={nom}
                onChangeText={setNom}
                style={styles.input}
            />
            <TextInput
                placeholder="O2 (%)"
                value={o2}
                onChangeText={setO2}
                keyboardType="numeric"
                style={styles.input}
            />
            <TextInput
                placeholder="He (%)"
                value={he}
                onChangeText={setHe}
                keyboardType="numeric"
                style={styles.input}
            />
            <View style={styles.buttons}>
                <Button title="Annuler" onPress={onClose} />
                <Button title="Enregistrer" onPress={handleSubmit} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    form: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 },
    buttons: { flexDirection: 'row', justifyContent: 'space-around' },
});
