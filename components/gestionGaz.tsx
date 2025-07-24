import React, { useState } from "react";
import { FlatList, Pressable, View, StyleSheet } from "react-native"
import { Dive } from "../lib/dive/dive";
import GazCard from "./GazCard";

type Props = {
    gaz: Dive.Gas[];
    setShowOpenGaz: (showOpenGaz: boolean) => void;
    setShowDeleteGaz: (showDeleteGaz: boolean) => void;
    setGazName: (name: string) => void;
};

export default function GestionGaz({ gaz, setShowOpenGaz, setShowDeleteGaz, setGazName }: Props) {

    return (
        <View style={styles.listcontainer}>
            <FlatList
                style={styles.flatlist}
                data={gaz}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) =>
                    <GazCard titre={item.name} pourcentO2={item.fO2 * 100} pourcentHe={item.fHe * 100} setShowOpenGaz={setShowOpenGaz} setShowDeleteGaz={setShowDeleteGaz} setGazName={setGazName} />
                }
                keyExtractor={(item, index) => index.toString()}
            />
        </View>);
}

const styles = StyleSheet.create({
    flatlist: {
        backgroundColor: 'transprent',
    },
    listcontainer: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
    }
});