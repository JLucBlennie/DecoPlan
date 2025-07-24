import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import appJson from './app.json';
import React, { useState } from 'react';
import AboutScreen from './components/about';
import CircleButton from './components/ui/CircleButton';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Buhlmann } from './lib/dive/buhlmann';
import { Dive } from './lib/dive/dive';
import TableauJSON from './components/ui/TableauJSON';
import ButtonLine from './components/ui/ButtonLine';
import GestionGaz from './components/gestionGaz';

export interface Plongee {
  id: number;
  name: string;
  segements: Dive.Segment[];
  gazFond: Dive.Gas[];
  gazDeco: Dive.Gas[];

  profondeur: (segements: Dive.Segment[]) => number;
  temps: (segments: Dive.Segment[]) => number;
}

const gazFond1 = Dive.gas("Tx2135", 0.21, 0.35);
const gazFond2 = Dive.gas("Tx2121", 0.21, 0.21);
const gazFond3 = Dive.gas("Tx2118", 0.21, 0.18);
const gazDeco1 = Dive.gas("Nx50", 0.5, 0);
const gazDeco2 = Dive.gas("Nx40", 0.4, 0);
const gazDeco3 = Dive.gas("Nx40", 0.4, 0);

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [runtime, setRuntime] = useState<Dive.Segment[]>([]);
  const [showRuntime, setShowRuntime] = useState(false);
  const [showGestionPlongees, setShowGestionPlongees] = useState(false);
  const [showGestionGaz, setShowGestionGaz] = useState(false);
  const [showGestionParametres, setShowGestionParametres] = useState(false);
  const [gazList, setGazList] = useState<Dive.Gas[]>([gazFond1, gazFond2, gazFond3, gazDeco1, gazDeco2, gazDeco3]);
  const [showOpenGaz, setShowOpenGaz] = useState(false);
  const [showDeleteGaz, setShowDeleteGaz] = useState(false);
  const [gazName, setGazName] = useState("");
  const [showAddGaz, setShowAddGaz] = useState(false);
  const [showOpenPlongee, setShowOpenPlongee] = useState(false);
  const [showDeletePlongee, setShowDeletePlongee] = useState(false);
  const [showAddPlongee, setShowAddPlongee] = useState(false);
  const [plongeeId, setPlongeeId] = useState<number>(-1);

  function resetButton() {
    setShowGestionGaz(false);
    setShowGestionPlongees(false);
    setShowGestionParametres(false);
    setShowRuntime(false);
    setShowAbout(false);
    setShowOpenGaz(false);
    setShowDeleteGaz(false);
    setGazName("");
    setShowAddGaz(false);
    setShowOpenPlongee(false);
    setShowDeletePlongee(false);
    setPlongeeId(-1);
    setShowAddPlongee(false);
  }

  function computeDive() {
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
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/*<SystemBar style="dark" />*/}
      <SafeAreaView style={mainStyles.container} edges={['top']}>
        {showAbout && <AboutScreen close={() => setShowAbout(false)} />}
        {!showAbout &&
          <View style={mainStyles.mainView}>
            <View style={mainStyles.descContainer}>
              <View style={mainStyles.titreContainer}>
                <Text style={mainStyles.text}>{appJson.expo.name}</Text>
              </View>
              {showRuntime &&
                <View style={mainStyles.editorContainer}>
                  <TableauJSON data={runtime} />
                  <Text style={mainStyles.attentionText}>ATTENTION !!! Il ne faut pas considérer que les runtimes générés sont qualifés pour plonger</Text>
                </View>
              }
              {!showRuntime && !showGestionGaz && !showGestionPlongees &&
                <View style={mainStyles.editorContainer}>
                  <ButtonLine iconName={'gaz'} text={'Gestion des Gaz'} onPress={() => setShowGestionGaz(true)} />
                  <ButtonLine iconName={'dive'} text={'Gestion des Plongées'} onPress={() => setShowGestionPlongees(true)} />
                  <ButtonLine iconName={'gear'} text={'Gestion des Paramètres'} onPress={() => setShowGestionParametres(true)} />
                </View>
              }
              {showGestionGaz && !showOpenGaz && !showDeleteGaz && !showAddGaz &&
                <View style={mainStyles.editorContainer}>
                  <GestionGaz gaz={gazList} setShowOpenGaz={setShowOpenGaz} setShowDeleteGaz={setShowDeleteGaz} setGazName={setGazName} />
                </View>
              }
              {showOpenGaz &&
                <View style={mainStyles.editorContainer}>
                  <Text>Edition du gaz {gazName}</Text>
                </View>
              }
              {showDeleteGaz &&
                <View style={mainStyles.editorContainer}>
                  <Text>Suppression du gaz {gazName}</Text>
                </View>
              }
              {showAddGaz &&
                <View style={mainStyles.editorContainer}>
                  <Text>Ajout d'un gaz</Text>
                </View>
              }
            </View>
            <View style={mainStyles.buttonContainer}>
              {(!showRuntime && !showGestionGaz && !showGestionPlongees) && <CircleButton onPress={() => setShowAbout(true)} iconName="help" />}
              {!showRuntime && !showGestionGaz && showGestionPlongees && <CircleButton onPress={() => computeDive()} iconName="palmes" position={'Right'} />}
              {(showRuntime || showGestionGaz || showGestionPlongees) && <CircleButton onPress={() => resetButton()} iconName="back" position={'Right'} />}
              {showAddGaz && <CircleButton onPress={() => setShowRuntime(false)} iconName="check" position={'Left'} />}
              {showGestionGaz && !showAddGaz && <CircleButton onPress={() => setShowAddGaz(true)} iconName="add" position={'Right'} />}
            </View>
          </View>
        }
      </SafeAreaView>
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
    height: '100%'
  },
  buttonContainer: {
    flex: 1 / 6,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%'
  },
  mainView: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  titreContainer: {
    flex: 1 / 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  editorContainer: {
    flex: 4 / 5,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  descContainer: {
    flex: 5 / 6,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 5
  },
  text: {
    fontSize: 24,
    color: '#0428f1ff',
  },
  attentionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    padding: 2
  }
});
