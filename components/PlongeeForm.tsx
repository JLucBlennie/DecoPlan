import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Dive } from '../lib/dive/dive';
import { useGazStore } from '../store/useGazStore';
import { usePlongeeStore } from '../store/usePlongeeStore';
import CheckBox from 'react-native-check-box';
import { mainStyles } from '../App';
import GestionSegments from './gestionSegments';
import CircleButton from './ui/CircleButton';
import PlongeeProfileGraph from './PlongeeProfileGraph';
import { useEditeur } from '../context/EditeurContext';

type PlongeeFormProps = {
    plongee: Dive.Plongee;
    onClose: () => void;
};

export default function PlongeeForm({ plongee, onClose }: PlongeeFormProps) {
    const { fermerEditeur } = useEditeur();
    const { gazList } = useGazStore();
    const [nom, setNom] = useState(plongee.name);
    const [gazFond, setGazFond] = useState<Dive.Gas[]>(plongee.gazFond);
    const [gazDeco, setGazDeco] = useState<Dive.Gas[]>(plongee.gazDeco);
    const { updatePlongee } = usePlongeeStore();
    const [segments, setSegments] = useState<Dive.Segment[]>(plongee.segments);
    const [newSegment, setNewSegment] = useState<Dive.Segment>({ startDepth: 0, endDepth: 0, gasName: '', time: 0 });

    const closeEditeur = () => {
        fermerEditeur();
        onClose();
    };

    const handleSubmit = () => {
        updatePlongee(plongee.id, {
            name: nom,
            gazFond,
            gazDeco,
            segments, // À remplir plus tard
        });
        closeEditeur();
    };

    // Préparer les options pour les sélecteurs
    const gazOptions = gazList.map(gaz => ({ item: gaz.id, name: gaz.name }));

    // Gérer la sélection des gaz
    // Fonction pour basculer la sélection d'un gaz (fond ou déco)
    const toggleGazSelection = (gaz: Dive.Gas, setSelectedGaz: React.Dispatch<React.SetStateAction<Dive.Gas[]>>, selectedGaz: Dive.Gas[]) => {
        setSelectedGaz(prev =>
            prev.some(g => g.id === gaz.id)
                ? prev.filter(g => g.id !== gaz.id)  // Désélectionne si déjà sélectionné
                : [...prev, gaz]  // Sélectionne sinon
        );
    };

    // Rendre un item de gaz avec une CheckBox
    const renderGazItem = (gaz: Dive.Gas, selectedGaz: Dive.Gas[], setSelectedGaz: React.Dispatch<React.SetStateAction<Dive.Gas[]>>) => (
        <TouchableOpacity
            style={styles.gazItem}
            onPress={() => toggleGazSelection(gaz, setSelectedGaz, selectedGaz)}
        >
            <CheckBox
                isChecked={selectedGaz.some(g => g.id === gaz.id)}
                onClick={() => toggleGazSelection(gaz, setSelectedGaz, selectedGaz)}
                checkBoxColor="#007AFF"
            />
            <Text style={styles.gazName}>{gaz.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.form}>
            <Text style={styles.label}>Nom de la plongée</Text>
            <TextInput
                style={styles.input}
                value={nom}
                onChangeText={setNom}
                placeholder="Ex: Plongée à Marseille"
            />

            <View style={styles.gazLists}>
                <View style={styles.gazList}>
                    <Text style={styles.label}>Gaz Fond</Text>
                    <FlatList
                        data={gazList}
                        renderItem={({ item }) => renderGazItem(item, gazFond, setGazFond)}
                        keyExtractor={item => item.id}
                        style={styles.list}
                    />
                </View>
                <View style={styles.gazList}>
                    <Text style={styles.label}>Gaz déco</Text>
                    <FlatList
                        data={gazList}
                        renderItem={({ item }) => renderGazItem(item, gazDeco, setGazDeco)}
                        keyExtractor={item => item.id}
                        style={styles.list}
                    />
                </View>
            </View>
            {/* Ici il faut voir comment on affiche les segments et aussi la possibilité d'en AjouterIl faut pouvoir les trier par profondeurs ==> Faire un composant pour ça... */}
            <PlongeeProfileGraph
                segments={segments}
                onUpdateSegment={(index, updatedSegment) => {
                    const newSegments = [...segments];
                    console.log("UpdateSegment : ", newSegments);
                    newSegments[index] = updatedSegment;
                    console.log("UpdateSegment modifier par : ", updatedSegment);
                    console.log("UpdateSegment modifie : ", newSegments);
                    setSegments(newSegments);
                    updatePlongee(plongee.id, { ...plongee, segments: newSegments });
                }}
                onAddSegment={(addedSegment) => {
                    const newSegments = [...segments];
                    console.log("AddSegment avant ajout : ", newSegments);
                    const newSegmentsList = [...newSegments, addedSegment];
                    console.log("AddSegment A ajouter : ", addedSegment);
                    console.log("AddSegment apres ajout : ", newSegmentsList);
                    setSegments(newSegmentsList);
                    updatePlongee(plongee.id, { ...plongee, segments: newSegmentsList });
                    setNewSegment({ startDepth: 0, endDepth: 0, gasName: '', time: 0 });
                }}
            />
            <View style={styles.buttons}>
                <CircleButton iconName="cancel" onPress={closeEditeur} position='Left' />
                <CircleButton iconName="check" onPress={handleSubmit} position='Right' />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    form: { padding: 16 },
    label: {
        fontSize: 16,
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
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
    gazItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    gazName: {
        marginLeft: 10,
    },
    list: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
    },
    segmentContainer: {
    },
    gazLists: {
        flexDirection: 'row',
        paddingBottom: 5
    },
    gazList: {
        flex: 1 / 2,
        flexDirection: 'column',
        padding: 5
    }
});
