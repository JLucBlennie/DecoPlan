import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useEditeur } from "../context/EditeurContext";
import { Gas } from "../lib/dive";
import { useGazStore } from "../store/useGazStore";
import { mainStyles } from "../styles/mainStyles";
import GazCard from "./GazCard";
import ButtonLine from "./ui/ButtonLine";

export default function GestionGaz() {
    const { ouvrirEditeur } = useEditeur();
    const { gazList, deleteGaz, resetGazList, setSelectedGaz } = useGazStore();

    const handleEditGaz = (gaz: Gas) => {
        setSelectedGaz(gaz);
        ouvrirEditeur('editgaz');
    };

    const handleAddGaz = () => {
        ouvrirEditeur('addgaz');
    }

    return (
        <View style={mainStyles.editorContainer}>
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
                <ButtonLine iconName={"clear"} onPress={resetGazList} text={"Reset la liste des Gaz..."} />
            </View>
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
