import React from "react";
import { FlatList, Pressable, View, StyleSheet } from "react-native"
import { Dive } from "../lib/dive/dive";
import GazCard from "./GazCard";

type Props = {
    gaz: Dive.Gas[];
    openGaz: (name: string) => (name: string) => void;
    deleteGaz: (name: string) => (name: string) => void;
};

export default function GestionGaz({ gaz, openGaz, deleteGaz }: Props) {
    return (
        <View style={styles.listcontainer}>
            <FlatList
                style={styles.flatlist}
                data={gaz}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) =>
                    <View >
                        <GazCard titre={item.name} pourcentO2={item.fO2 * 100} pourcentHe={item.fHe * 100} openGaz={openGaz(item.name)} deleteGaz={deleteGaz(item.name)} />
                    </View>
                }
                keyExtractor={(item, index) => index.toString()}
            />
        </View>);
}

const styles = StyleSheet.create({
    listTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transprent'
    },
    flatlist: {
        flex: 1,
        backgroundColor: 'transprent'
    },
    listcontainer: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center'
    }
});