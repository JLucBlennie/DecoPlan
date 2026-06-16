import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Gas } from '../lib/dive';
import { useGazStore } from '../store/useGazStore';
import CircleButton from './ui/CircleButton';

export default function AddGazForm() {
    const { addGaz } = useGazStore();
    const [nom, setNom] = useState("");
    const [o2, setO2] = useState("21");
    const [he, setHe] = useState("0");

    const handleSubmit = () => {
        if (!nom || !o2 || !he) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        addGaz(Gas.create(nom, parseFloat(o2) / 100, parseFloat(he) / 100));
        router.back();
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
