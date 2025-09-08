import React, { useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native"
import { Dive } from "../lib/dive/dive";
import { usePlongeeStore } from "../store/usePlongeeStore";
import { mainStyles } from "../App";
import ButtonLine from "./ui/ButtonLine";
import PlongeeCard from "./PlongeeCard";
import AddPlongeeForm from "./AddPlongeeForm";
import PlongeeForm from "./PlongeeForm";

export default function GestionPlongee() {
    const { plongeeList, deletePlongee, resetPlongeeList } = usePlongeeStore();
    const [editingPlongee, setEditingPlongee] = useState<Dive.Plongee | null>(null);
    const [showAddPlongee, setShowAddPlongee] = useState(false);

    const handleEditPlongee = (plongee: Dive.Plongee) => {
        setEditingPlongee(plongee);
    };

    const handleCloseForm = () => {
        setEditingPlongee(null);
        setShowAddPlongee(false);
    };

    const handleAddPlongee = () => {
        setShowAddPlongee(true);
    }

    return (
        <View style={mainStyles.editorContainer}>
            {editingPlongee &&
                <PlongeeForm plongee={editingPlongee} onClose={handleCloseForm} />
            }
            {showAddPlongee &&
                <AddPlongeeForm onClose={handleCloseForm} />
            }
            {!showAddPlongee && editingPlongee === null &&
                <View style={mainStyles.editorContainer}>
                    <Text style={styles.title}>Liste des Plongées</Text>
                    <View style={styles.listcontainer}>
                        <FlatList
                            style={styles.flatlist}
                            data={plongeeList}
                            showsVerticalScrollIndicator={true}
                            renderItem={({ item }) => <PlongeeCard plongee={item} onPress={() => { handleEditPlongee(item); }} onDelete={() => { deletePlongee(item.id); }} />}
                            keyExtractor={(item) => item.id} />
                    </View>
                    <ButtonLine iconName={"add"} onPress={handleAddPlongee} text={"Ajouter une Plongée..."} />
                    <ButtonLine iconName={"clear"} onPress={resetPlongeeList} text={"Reset la liste des Plongées..."} />
                </View>
            }
        </View >
    );
}

const styles = StyleSheet.create({
    flatlist: {
        backgroundColor: 'transprent',
        width: '100%'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        width: '100%'
    },
    listcontainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
});