// components/GasPicker.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dive } from '../lib/dive/dive';
import DropDownPicker from 'react-native-dropdown-picker';

type PlongeePickerProps = {
    plongees: Dive.Plongee[];          // Liste des plongees disponibles
    selectedPlongee: string | null; // ID de la plongee sélectionnée
    onPlongeeSelect: (plongeeId: string | null) => void; // Callback pour la sélection
};

export default function PlongeePicker({ plongees, selectedPlongee: selectedPlongee, onPlongeeSelect: onPlongeeSelect }: PlongeePickerProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(selectedPlongee);

    // Met à jour la valeur locale si `selectedPlongee` change (ex: depuis le parent)
    useEffect(() => {
        setValue(selectedPlongee);
    }, [selectedPlongee]);

    return (
        <View style={styles.container}>
            <DropDownPicker
                open={open}
                value={value}
                items={plongees.map(plongee => ({
                    label: plongee.name,
                    value: plongee.id,
                }))}
                setOpen={setOpen}
                setValue={setValue}
                onChangeValue={(selectedValue) => {
                    onPlongeeSelect(selectedValue);  // ⬅️ Appelle le callback parent avec la nouvelle valeur
                }}
                placeholder="Sélectionnez une plongée"
                style={styles.picker}
                dropDownContainerStyle={styles.dropDownContainer}
                placeholderStyle={styles.placeholder}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 1000,  // Important pour éviter les problèmes de superposition
    },
    picker: {
        borderColor: '#ccc',
        backgroundColor: '#fafafa',
    },
    pickerContainer: {
        borderColor: '#ccc',
        height: 50,
    },
    dropDownContainer: {
        borderColor: '#ccc',
    },
    placeholder: {
        color: '#999',
    },
});
