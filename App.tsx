import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { EditeurProvider, useEditeur } from './context/EditeurContext';
import { useGazStore } from './store/useGazStore';
import { usePlongeeStore } from './store/usePlongeeStore';

import AboutScreen from './components/about';
import AddGazForm from './components/AddGazForm';
import AddPlongeeForm from './components/AddPlongeeForm';
import BoutonRetour from './components/BoutonRetour';
import GazForm from './components/GazForm';
import GestionGaz from './components/gestionGaz';
import GestionPlongee from './components/gestionPlongee';
import MenuPrincipal from './components/MenuPrincipal';
import { PedagogicalModeScreen } from './components/PedagogicalModeScreen';
import PlongeeForm from './components/PlongeeForm';
import RuntimeScreen from './components/RuntimeScreen';

import { GasData } from './lib/dive';
import { mainStyles } from './styles/mainStyles';

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
  const {
    editeurActif, fermerEditeur,
    pedagogicalPlanA, pedagogicalPlanB,
  } = useEditeur();

  const { initializeGazList, selectedGaz, setSelectedGaz } = useGazStore();
  const { initializePlongeeList, selectedPlongee, setSelectedPlongee } = usePlongeeStore();

  useEffect(() => {
    initializeGazList();
    initializePlongeeList();
  }, []);

  const handleClosePlongeeForm = () => {
    setSelectedPlongee({ name: '', id: '', segments: [], gazFond: [], gazDeco: [] });
  };

  const handleCloseGazForm = () => {
    setSelectedGaz({
      id: '', name: '', fO2: 0, fHe: 0, fN2: 0,
      modInMeters: () => { throw new Error('not implemented'); },
      endInMeters: () => { throw new Error('not implemented'); },
      eadInMeters: () => { throw new Error('not implemented'); },
      toJSON: function (): GasData {
        throw new Error('Function not implemented.');
      },
      o2Percent: 0,
      hePercent: 0,
      ppO2AtDepth: function (depth: number, isFreshWater: boolean): number {
        throw new Error('Function not implemented.');
      },
      isAir: false,
      isNitrox: false,
      isTrimix: false,
      isHyperoxic: false,
      shortLabel: ''
    });
  };

  // ── Mode pédagogique : plein écran, sans wrapper editorContainer ───────────
  if (editeurActif === 'pedagogical' && pedagogicalPlanA) {
    return (
      <SafeAreaView style={mainStyles.container}>
        <StatusBar style="light" />
        <PedagogicalModeScreen
          plan={pedagogicalPlanA}
          comparisonPlan={pedagogicalPlanB}
          onClose={fermerEditeur}
        />
      </SafeAreaView>
    );
  }

  // ── Navigation classique ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={mainStyles.container}>
      <StatusBar style="auto" />
      {editeurActif ? (
        <View style={mainStyles.editorContainer}>
          {/* BoutonRetour visible seulement pour ces écrans (pas 'pedagogical') */}
          {(
            editeurActif === 'gaz' ||
            editeurActif === 'plongee' ||
            editeurActif === 'runtime' ||
            editeurActif === 'about'
          ) && <BoutonRetour onPress={fermerEditeur} />}

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