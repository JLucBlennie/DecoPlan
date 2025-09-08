import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import AboutScreen from './components/about';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Dive } from './lib/dive/dive';
import GestionGaz from './components/gestionGaz';
import { useGazStore } from './store/useGazStore';
import { EditeurContext } from './context/EditeurContext';
import PlongeeEditor from './components/plongeeEditor';
import MenuPrincipal from './components/MenuPrincipal';
import BoutonRetour from './components/BoutonRetour';
import GestionPlongee from './components/gestionPlongee';

export interface Plongee {
  id: number;
  name: string;
  segements: Dive.Segment[];
  gazFond: Dive.Gas[];
  gazDeco: Dive.Gas[];

  profondeur: (segments: Dive.Segment[]) => number;
  temps: (segments: Dive.Segment[]) => number;
}



export default function App() {
  const [editeurActif, setEditeurActif] = useState<'gaz' | 'plongee' | 'about' | null>(null);
  const { initialize } = useGazStore();

  useEffect(() => {
    initialize();
  }, []);

  /* function computeDive() {
    console.log("Chargement de l'algo...");
    var deco = new Buhlmann.Plan(Buhlmann.ZH16CTissues);
    console.log("Definition du gaz fond");
    deco.addBottomGas(gazFond1);
    console.log("Definition du gaz Deco");
    deco.addDecoGas(gazDeco1);
    console.log("Descente a 50 avec le Tx");
    deco.addDepthChange(0, 50, "Tx2135", 50 / 20);
    console.log("On fait une plongee de 25 min");
    deco.addFlat(50, "Tx2135", 25);
    console.log("Calcul de la deco...");
    var runtime = deco.calculateDecompression(false, 0.5, 0.7, 1.6, 30, undefined);
    console.log("Resultat de la deco :");
    console.log(runtime);
    setRuntime(runtime);
    setShowRuntime(true);
  } */

  return (
    <SafeAreaProvider>
      <EditeurContext.Provider value={{ editeurActif, setEditeurActif }}>
        <SafeAreaView style={mainStyles.container}>
          <StatusBar style="auto" />
          {editeurActif ?
            (
              <View style={mainStyles.editorContainer}>
                <BoutonRetour />
                {editeurActif === 'gaz' && <GestionGaz />}
                {editeurActif === 'plongee' && <GestionPlongee />}
                {editeurActif === 'about' && <AboutScreen />}
              </View>
            ) : (
              <MenuPrincipal />
            )
          }
        </SafeAreaView>
      </EditeurContext.Provider>
    </SafeAreaProvider>
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
