import React from "react";
import { FlatList, Pressable, View, StyleSheet } from "react-native"
import { Plongee } from "../App";
import PlongeeCard from "./PlongeeCard";

type Props = {
    plongees: Plongee[];
    openPlongee: (id: number) => void;
    deletePlongee: (id: number) => void;
};

export default function GestionPlongee({ plongees, openPlongee, deletePlongee }: Props) {
    return (
        <View style={styles.listcontainer}>
            <FlatList
                style={styles.flatlist}
                data={plongees}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) =>
                    <View >
                        <Pressable onPress={() => { openPlongee(item.id) }} onLongPress={() => { deletePlongee(item.id) }}>
                            <PlongeeCard titre={item.name} profondeur={item.profondeur(item.segements)} temps={item.temps(item.segements)} gazFond={item.gazFond[0].name} />
                        </Pressable>
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