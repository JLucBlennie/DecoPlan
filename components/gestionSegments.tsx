import { View, Text, TextInput, StyleSheet } from "react-native";
import { Dive } from "../lib/dive/dive";
import CircleButton from "./ui/CircleButton";

type GestionSegmentsProps = {
    newSegment: Dive.Segment;
    setNewSegment: (segment: Dive.Segment) => void;
    addSegment: () => void;
};

export default function GestionSegments({ newSegment, setNewSegment, addSegment }: GestionSegmentsProps) {
    return (
        <View style={styles.segmentContainer}>
            {/* Ici il faut voir comment on affiche les segments et aussi la possibilité d'en AjouterIl faut pouvoir les trier par profondeurs ==> Faire un composant pour ça... */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Ajouter un segment</Text>
                <View style={styles.textInput}>
                    <Text style={[styles.labelInput, styles.label]}>Profondeur de début :</Text>
                    <TextInput
                        placeholder="Profondeur de début"
                        value={newSegment.startDepth.toString()}
                        onChangeText={(text) => setNewSegment({ ...newSegment, startDepth: parseFloat(text) || 0 })}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
                <View style={styles.textInput}>
                    <Text style={[styles.labelInput, styles.label]}>Profondeur de fin :</Text>
                    <TextInput
                        placeholder="Profondeur de fin"
                        value={newSegment.endDepth.toString()}
                        onChangeText={(text) => setNewSegment({ ...newSegment, endDepth: parseFloat(text) || 0 })}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
                <View style={styles.textInput}>
                    <Text style={[styles.labelInput, styles.label]}>Temps (min) :</Text>
                    <TextInput
                        placeholder="Temps (min)"
                        value={newSegment.time.toString()}
                        onChangeText={(text) => setNewSegment({ ...newSegment, time: parseFloat(text) || 0 })}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
            </View>
            {/* Ajouter la liste de gaz fond sélectionnés dans la page */}
            <View style={styles.buttonContainer}>
                <CircleButton iconName="add" onPress={addSegment} size={16} />
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    segmentContainer: {
        flexDirection: 'row',
        width: '100%',
        alignContent: 'space-around',
        alignItems: 'flex-end',
        alignSelf: 'stretch',
        backgroundColor: 'transparent',
        paddingBottom: 15
    },
    label: {
        fontSize: 16,
        marginBottom: 8
    },
    inputContainer: {
        flex: 4 / 5,
        flexDirection: 'column',
        alignItems: 'center',
    },
    buttonContainer: {
        flex: 1 / 5,
        padding: 5
    },
    input: {
        flex: 3 / 5,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
    },
    textInput: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelInput: {
        flex: 2 / 5,
    }
});