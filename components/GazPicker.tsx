// components/GasPicker.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Dive } from '../lib/dive/dive';

type GasPickerProps = {
    gases: Dive.Gas[];          // Liste des gaz disponibles
    selectedGas: string | null; // ID du gaz sélectionné
    onGasSelect: (gasId: string) => void; // Callback pour la sélection
};

export default function GasPicker({ gases, selectedGas, onGasSelect }: GasPickerProps) {
    return (
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedGas}
                onValueChange={(itemValue) => { if (itemValue) onGasSelect(itemValue) }}
                style={styles.picker}
            >
                <Picker.Item label="Sélectionnez un gaz" value={null} />
                {gases.map((gas) => (
                    <Picker.Item
                        key={gas.id}
                        label={`${gas.name} (O₂: ${gas.fO2}%, He: ${gas.fHe}%)`}
                        value={gas.id}
                    />
                ))}
            </Picker>
        </View>
    );
}

const styles = StyleSheet.create({
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden', // Pour arrondir les bords sur iOS
    },
    picker: {
        height: 50,
        width: '100%',
    },
});
