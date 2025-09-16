import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useGazStore } from '../store/useGazStore';
import { Dive } from '../lib/dive/dive';
import CircleButton from './ui/CircleButton';
import { useEditeur } from '../context/EditeurContext';

export default function AddGazForm() {
    const { fermerEditeur } = useEditeur();
    const { addGaz } = useGazStore();
    const [nom, setNom] = useState("");
    const [o2, setO2] = useState("21");
    const [he, setHe] = useState("0");

    const closeEditeur = () => {
        fermerEditeur();
    };

    const handleSubmit = () => {
        if (!nom || !o2 || !he) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        addGaz(Dive.gas(nom, parseFloat(o2) / 100, parseFloat(he) / 100));
        closeEditeur();
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
                <Text style={styles.labelInput}>O2 (%) :</Text>
                <TextInput
                    placeholder="O2 (%)"
                    value={o2}
                    onChangeText={setO2}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
            <View style={styles.textInput}>
                <Text style={styles.labelInput}>He (%) :</Text>
                <TextInput
                    placeholder="He (%)"
                    value={he}
                    onChangeText={setHe}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
            <View style={styles.buttons}>
                <CircleButton iconName="cancel" onPress={closeEditeur} position='Left' />
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
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    input: {
        flex: 3 / 4,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginBottom: 8
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
