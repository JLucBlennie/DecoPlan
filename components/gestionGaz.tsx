import React, { useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native"
import { Dive } from "../lib/dive/dive";
import GazCard from "./GazCard";
import { useGazStore } from "../store/useGazStore";
import { mainStyles } from "../App";
import GazForm from "./GazForm";
import ButtonLine from "./ui/ButtonLine";
import AddGazForm from "./AddGazForm";

export default function GestionGaz() {
    const { gazList, deleteGaz, resetList } = useGazStore();
    const [editingGaz, setEditingGaz] = useState<Dive.Gas | null>(null);
    const [showAddGaz, setShowAddGaz] = useState(false);

    const handleEditGaz = (gaz: Dive.Gas) => {
        setEditingGaz(gaz);
    };

    const handleCloseForm = () => {
        setEditingGaz(null);
        setShowAddGaz(false);
    };

    const handleAddGaz = () => {
        setShowAddGaz(true);
    }

    return (
        <View style={mainStyles.editorContainer}>
            {editingGaz &&
                <GazForm gaz={editingGaz} onClose={handleCloseForm} />
            }
            {showAddGaz &&
                <AddGazForm onClose={handleCloseForm} />
            }
            {!showAddGaz && editingGaz === null &&
                <View style={mainStyles.editorContainer}>
                    <Text style={styles.title}>Liste des Gaz</Text>
                    <View style={styles.listcontainer}>
                        <FlatList
                            style={styles.flatlist}
                            data={gazList}
                            showsVerticalScrollIndicator={true}
                            renderItem={({ item }) => <GazCard gaz={item} onPress={() => { handleEditGaz(item); }} onDelete={() => { deleteGaz(item.id); }} />}
                            keyExtractor={(item) => item.id} />
                    </View>
                    <ButtonLine iconName={"add"} onPress={handleAddGaz} text={"Ajouter un Gaz..."} />
                    <ButtonLine iconName={"clear"} onPress={resetList} text={"Reset la liste des Gaz..."} />
                </View>
            }
        </View >
    );
}

const styles = StyleSheet.create({
    flatlist: {
        backgroundColor: 'transprent',
        width: '100%',
        alignSelf: 'stretch',
        borderColor: 'cyan',
        borderWidth: 2
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    listcontainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
});