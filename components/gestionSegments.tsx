import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Gas, Segment } from "../lib/dive";
import { mainStyles } from "../styles/mainStyles";
import GasPicker from "./GazPicker";
import CircleButton from "./ui/CircleButton";

type GestionSegmentsProps = {
    segment: Segment | null;
    addSegmentMode: boolean;
    gazFondList: Gas[];
    setNewSegment: (segment: Segment) => void;
    onClose: () => void;
};

export default function GestionSegments({ segment, addSegmentMode, gazFondList, setNewSegment, onClose }: GestionSegmentsProps) {
    const [localSegment, setLocalSegment] = useState<Segment>(segment ?? {
        startDepth: 0,
        endDepth: 0,
        gasName: '',
        time: 0
    })

    function gazFondId(name: string): string {
        if (gazFondList) {
            for (var i = 0; i < gazFondList.length; i++) {
                if (gazFondList[i].name === name) {
                    return gazFondList[i].id;
                }
            }
            return gazFondList[0].id;
        }
        return "";
    }

    function handleGasSelect(gasId: string | null) {
        const selectedGas = gazFondList.find(gas => gas.id === gasId);
        setLocalSegment({
            ...localSegment,
            gasName: selectedGas ? selectedGas.name : '',
        });
    };

    return (
        <View style={mainStyles.editorContainer}>
            {/* Ici il faut voir comment on affiche les segments et aussi la possibilité d'en AjouterIl faut pouvoir les trier par profondeurs ==> Faire un composant pour ça... */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{addSegmentMode ? 'Ajouter' : 'Editer'} un segment</Text>
                <View style={styles.textInput}>
                    <Text style={[styles.labelInput, styles.label]}>Profondeur de début :</Text>
                    <TextInput
                        placeholder="Profondeur de début"
                        value={localSegment.startDepth.toString()}
                        onChangeText={(text) => setLocalSegment({ ...localSegment, startDepth: parseFloat(text) || 0 })}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
                <View style={styles.textInput}>
                    <Text style={[styles.labelInput, styles.label]}>Profondeur de fin :</Text>
                    <TextInput
                        placeholder="Profondeur de fin"
                        value={localSegment.endDepth.toString()}
                        onChangeText={(text) => setLocalSegment({ ...localSegment, endDepth: parseFloat(text) || 0 })}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
                <View style={styles.textInput}>
                    <Text style={[styles.labelInput, styles.label]}>Temps (min) :</Text>
                    <TextInput
                        placeholder="Temps (min)"
                        value={localSegment.time.toString()}
                        onChangeText={(text) => setLocalSegment({ ...localSegment, time: parseFloat(text) || 0 })}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
                <View style={styles.textInput}>
                    <Text style={[styles.labelInput, styles.label]}>Gaz Fond :</Text>
                    {/* Picker pour sélectionner le gaz */}
                    <GasPicker
                        gases={gazFondList}
                        selectedGas={gazFondId(localSegment.gasName)}
                        onGasSelect={handleGasSelect}
                    />
                </View>
            </View>
            {/* Ajouter la liste de gaz fond sélectionnés dans la page */}
            <View style={styles.buttonContainer}>
                {addSegmentMode && <CircleButton iconName="add" onPress={() => { setNewSegment(localSegment); onClose(); }} />}
                {!addSegmentMode && <CircleButton iconName="check" onPress={() => { setNewSegment(localSegment); onClose(); }} />}
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
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