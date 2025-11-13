import { View, Text, TextInput, StyleSheet } from "react-native";
import CircleButton from "./ui/CircleButton";
import { useState } from "react";
import { usePlongeeStore } from "../store/usePlongeeStore";
import PlongeePicker from "./PlongeePicker";
import { Dive } from "../lib/dive/dive";
import { mainStyles } from "../styles/mainStyles";

export default function RuntimeScreen() {
    const [gfBas, setGFBas] = useState("90");
    const [gfHaut, setGFHaut] = useState("90");
    const { plongeeList } = usePlongeeStore();
    const [selectedPlongee, setSelectedPlongee] = useState<Dive.Plongee | null>(null);

    console.log("Liste des plongées disponibles :", plongeeList);

    function handleSubmit(): void {
        console.log("Lancement du calcul du Runtime avec GF Bas:", gfBas, "GF Haut:", gfHaut, "Plongée sélectionnée:", selectedPlongee);
    }

    const handlePlongeeSelect = (plongeeId: string | null) => {
        const plongee = plongeeList.find(plongee => plongee.id === plongeeId);
        console.log("Plongée sélectionnée :", plongee);
        if (plongee === undefined) {
            console.log("Plongée non trouvée pour l'ID :", plongeeId);
            return;
        } else {
            setSelectedPlongee(plongee);
        }
    };

    return (
        <View style={mainStyles.editorContainer}>
            <Text style={mainStyles.text}>Lancement du calul du Runtime...</Text>

            {/* Partie de paramétrage pour les GF et vitesses ... */}
            <View style={styles.textInput}>
                <Text style={styles.labelInput}>GF Bas :</Text>
                <TextInput
                    placeholder="GF Bas"
                    value={gfBas}
                    onChangeText={setGFBas}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
            <View style={styles.textInput}>
                <Text style={styles.labelInput}>GF Haut :</Text>
                <TextInput
                    placeholder="GF Haut"
                    value={gfHaut}
                    onChangeText={setGFHaut}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
            {/* Liste des plongée avec 1 seul choix */}
            <View style={styles.pickerContainer}>
                <PlongeePicker
                    plongees={plongeeList}
                    selectedPlongee={null}
                    onPlongeeSelect={handlePlongeeSelect}
                />
            </View>
            {/* Bouton de lancement du calcul */}
            <View style={styles.buttons}>
                <CircleButton iconName="check" onPress={handleSubmit} position='Right' />
            </View>
            {/* Affichage du tableau de résultat */}
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
    },
    flatlist: {
        backgroundColor: 'transprent',
        width: '100%'
    },
    listcontainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',  // Fond blanc pour mieux voir le champ
        justifyContent: 'center',
    },
});
