import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import CheckBox from 'react-native-check-box';
import { Dive } from '../lib/dive/dive';
import { useGazStore } from '../store/useGazStore';
import { usePlongeeStore } from '../store/usePlongeeStore';
import uuid from 'react-native-uuid';
import { mainStyles } from '../App';
import CircleButton from './ui/CircleButton';
import GestionSegments from './gestionSegments';

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
    <View style={styles.form}>
      <Text style={styles.label}>Nom de la plongée</Text>
      <TextInput
        style={styles.input}
        value={nom}
        onChangeText={setNom}
        placeholder="Ex: Plongée à Marseille"
      />
      <View style={styles.gazLists}>
        <View style={styles.gazList}>
          <Text style={styles.label}>Gaz fond</Text>
          <FlatList
            data={gazList}
            renderItem={({ item }) => renderGazItem(item, gazFond, setGazFond)}
            keyExtractor={item => item.id}
            style={styles.list}
          />
        </View>
        <View style={styles.gazList}>
          <Text style={styles.label}>Gaz déco</Text>
          <FlatList
            data={gazList}
            renderItem={({ item }) => renderGazItem(item, gazDeco, setGazDeco)}
            keyExtractor={item => item.id}
            style={styles.list}
          />
        </View>
      </View>

      {/* Ici il faut voir comment on affiche les segments et aussi la possibilité d'en AjouterIl faut pouvoir les trier par profondeurs ==> Faire un composant pour ça... */}
      <GestionSegments newSegment={newSegment} setNewSegment={setNewSegment} addSegment={addSegment} />

      <View style={styles.buttons}>
        <CircleButton iconName="cancel" onPress={onClose} position='Left' />
        <CircleButton iconName="check" onPress={handleSubmit} position='Right' />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 16 },
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
  gazLists: {
    flexDirection: 'row',
    paddingBottom: 5
  },
  gazList: {
    flex: 1 / 2,
    flexDirection: 'column',
    padding: 5
  }
});
