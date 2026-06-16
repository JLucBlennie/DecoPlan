// components/GasPicker.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Gas } from '../lib/dive';

type GasPickerProps = {
    gases: Gas[];          // Liste des gaz disponibles
    selectedGas: string | null; // ID du gaz sélectionné
    onGasSelect: (gasId: string | null) => void; // Callback pour la sélection
};

export default function GasPicker({ gases, selectedGas: selectedGas, onGasSelect: onGasSelect }: GasPickerProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(selectedGas);

    // Met à jour la valeur locale si `selectedPlongee` change (ex: depuis le parent)
    useEffect(() => {
        setValue(selectedGas);
    }, [selectedGas]);

    return (
        <View style={styles.container}>
            <DropDownPicker
                open={open}
                value={value}
                items={gases.map(gas => ({
                    label: gas.name,
                    value: gas.id,
                }))}
                setOpen={setOpen}
                setValue={setValue}
                onChangeValue={(selectedValue) => {
                    onGasSelect(selectedValue);  // ⬅️ Appelle le callback parent avec la nouvelle valeur
                }}
                placeholder="Sélectionnez un gaz"
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
