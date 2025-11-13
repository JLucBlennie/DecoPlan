import React, { useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native"
import { Dive } from "../lib/dive/dive";
import { usePlongeeStore } from "../store/usePlongeeStore";
import ButtonLine from "./ui/ButtonLine";
import PlongeeCard from "./PlongeeCard";
import { useEditeur } from "../context/EditeurContext";
import { mainStyles } from "../styles/mainStyles";

export default function GestionPlongee() {
    const { ouvrirEditeur } = useEditeur();
    const { plongeeList, deletePlongee, resetPlongeeList, setSelectedPlongee } = usePlongeeStore();

    const handleEditPlongee = (plongee: Dive.Plongee) => {
        setSelectedPlongee(plongee);
        ouvrirEditeur('editplongee');
    };

    const handleAddPlongee = () => {
        ouvrirEditeur('addplongee')
    };

    return (
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