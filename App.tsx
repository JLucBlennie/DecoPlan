import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { EditeurProvider, useEditeur } from './context/EditeurContext';
import { useGazStore } from './store/useGazStore';
import { usePlongeeStore } from './store/usePlongeeStore';
import GestionGaz from './components/gestionGaz';
import MenuPrincipal from './components/MenuPrincipal';
import BoutonRetour from './components/BoutonRetour';
import AboutScreen from './components/about';
import GestionPlongee from './components/gestionPlongee';
import RuntimeScreen from './components/RuntimeScreen';
import AddPlongeeForm from './components/AddPlongeeForm';
import PlongeeForm from './components/PlongeeForm';
import AddGazForm from './components/AddGazForm';
import GazForm from './components/GazForm';

export default function App() {
  return (
    <SafeAreaProvider>
      <EditeurProvider>
        <AppContent />
      </EditeurProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { editeurActif, fermerEditeur } = useEditeur();
  const { initializeGazList, selectedGaz, setSelectedGaz } = useGazStore();
  const { initializePlongeeList, selectedPlongee, setSelectedPlongee, plongeeList, deletePlongee, resetPlongeeList } = usePlongeeStore();

  useEffect(() => {
    initializeGazList();
    initializePlongeeList();
  }, []);

  const handleClosePlongeeForm = () => {
    setSelectedPlongee({
      name: '',
      id: '',
      segments: [],
      gazFond: [],
      gazDeco: []
    });
  };
  const handleCloseGazForm = () => {
    setSelectedGaz({
      id: '',
      name: '',
      fO2: 0,
      fHe: 0,
      fN2: 0,
      modInMeters: function (ppO2: number, isFreshWater: boolean): number {
        throw new Error('Function not implemented.');
      },
      endInMeters: function (depth: number, isFreshWater: boolean): number {
        throw new Error('Function not implemented.');
      },
      eadInMeters: function (depth: number, isFreshWater: boolean): number {
        throw new Error('Function not implemented.');
      }
    });
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <StatusBar style="auto" />
      {editeurActif ? (
        <View style={mainStyles.editorContainer}>
          {(editeurActif === 'gaz' || editeurActif === 'plongee' || editeurActif === 'runtime' || editeurActif === 'about') && <BoutonRetour onPress={fermerEditeur} />}
          {editeurActif === 'gaz' && <GestionGaz />}
          {editeurActif === 'addgaz' && <AddGazForm />}
          {editeurActif === 'editgaz' && <GazForm onClose={handleCloseGazForm} gaz={selectedGaz} />}
          {editeurActif === 'plongee' && <GestionPlongee />}
          {editeurActif === 'addplongee' && <AddPlongeeForm />}
          {editeurActif === 'editplongee' && <PlongeeForm onClose={handleClosePlongeeForm} plongee={selectedPlongee} />}
          {editeurActif === 'runtime' && <RuntimeScreen />}
          {editeurActif === 'about' && <AboutScreen />}
        </View>
      ) : (
        <MenuPrincipal />
      )}
    </SafeAreaView>
  );
}

export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#b4e3e98c',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        maxWidth: '100%',  // Force la largeur maximale sur le web
      },
    })
  },
  editorContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    padding: 5
  },
  text: {
    fontSize: 24,
    color: '#0428f1ff',
  },
  titre: {
    fontSize: 30,
    color: '#0428f1ff',
  },
  attentionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    padding: 2
  }
});
