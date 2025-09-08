import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import CheckBox from 'react-native-check-box';
import { Dive } from '../lib/dive/dive';
import { useGazStore } from '../store/useGazStore';
import { usePlongeeStore } from '../store/usePlongeeStore';
import uuid from 'react-native-uuid';
import { mainStyles } from '../App';

type PlongeeFormProps = {
  onClose: () => void;
};

export default function AddPlongeeForm({ onClose }: PlongeeFormProps) {
  const { gazList } = useGazStore();
  const [nom, setNom] = useState("");
  const [gazFond, setGazFond] = useState<Dive.Gas[]>([]);
  const [gazDeco, setGazDeco] = useState<Dive.Gas[]>([]);
  const { addPlongee } = usePlongeeStore();
  const [segments, setSegments] = useState<Dive.Segment[]>([]);
  const [newSegment, setNewSegment] = useState<Dive.Segment>({ startDepth: 0, endDepth: 0, gasName: '', time: 0 });

  const addSegment = () => {
    setSegments([...segments, newSegment]);
    setNewSegment({ startDepth: 0, endDepth: 0, gasName: '', time: 0 });
  };
  const handleSubmit = () => {
    addPlongee({
      id: uuid.v4(),
      name: nom,
      gazFond,
      gazDeco,
      segments
    });
    onClose();
  };

  // Préparer les options pour les sélecteurs
  const gazOptions = gazList.map(gaz => ({ item: gaz.id, name: gaz.name }));

  // Gérer la sélection des gaz
  // Fonction pour basculer la sélection d'un gaz (fond ou déco)
  const toggleGazSelection = (gaz: Dive.Gas, setSelectedGaz: React.Dispatch<React.SetStateAction<Dive.Gas[]>>, selectedGaz: Dive.Gas[]) => {
    setSelectedGaz(prev =>
      prev.some(g => g.id === gaz.id)
        ? prev.filter(g => g.id !== gaz.id)  // Désélectionne si déjà sélectionné
        : [...prev, gaz]  // Sélectionne sinon
    );
  };

  // Rendre un item de gaz avec une CheckBox
  const renderGazItem = (gaz: Dive.Gas, selectedGaz: Dive.Gas[], setSelectedGaz: React.Dispatch<React.SetStateAction<Dive.Gas[]>>) => (
    <TouchableOpacity
      style={styles.gazItem}
      onPress={() => toggleGazSelection(gaz, setSelectedGaz, selectedGaz)}
    >
      <CheckBox
        isChecked={selectedGaz.some(g => g.id === gaz.id)}
        onClick={() => toggleGazSelection(gaz, setSelectedGaz, selectedGaz)}
        checkBoxColor="#007AFF"
      />
      <Text style={styles.gazName}>{gaz.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={mainStyles.editorContainer}>
      <Text style={styles.label}>Nom de la plongée</Text>
      <TextInput
        style={styles.input}
        value={nom}
        onChangeText={setNom}
        placeholder="Ex: Plongée à Marseille"
      />

      <Text style={styles.label}>Gaz de fond</Text>
      <FlatList
        data={gazList}
        renderItem={({ item }) => renderGazItem(item, gazFond, setGazFond)}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <Text style={styles.label}>Gaz de décompression</Text>
      <FlatList
        data={gazList}
        renderItem={({ item }) => renderGazItem(item, gazDeco, setGazDeco)}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <View style={styles.segmentContainer}>
        <Text>Ajouter un segment</Text>
        <TextInput
          placeholder="Profondeur de début"
          value={newSegment.startDepth.toString()}
          onChangeText={(text) => setNewSegment({ ...newSegment, startDepth: parseFloat(text) || 0 })}
        />
        <TextInput
          placeholder="Profondeur de fin"
          value={newSegment.endDepth.toString()}
          onChangeText={(text) => setNewSegment({ ...newSegment, endDepth: parseFloat(text) || 0 })}
        />
        <TextInput
          placeholder="Temps (min)"
          value={newSegment.time.toString()}
          onChangeText={(text) => setNewSegment({ ...newSegment, time: parseFloat(text) || 0 })}
        />
        <Button title="Ajouter" onPress={addSegment} />
      </View>

      <View style={styles.buttons}>
        <Button title="Annuler" onPress={onClose} />
        <Button title="Enregistrer" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  gazItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  gazName: {
    marginLeft: 10,
  },
  list: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  segmentContainer: {
  },
});
