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

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [runtime, setRuntime] = useState<Dive.Segment[]>([]);
  const [showTableau, setShowTableau] = useState(false);

  function computeDive() {
    console.log("Chargement de l'algo...");
    var deco = new Buhlmann.Plan(Buhlmann.ZH16CTissues);
    console.log("Definition du gaz fond");
    deco.addBottomGas("Tx2135", 0.21, 0.35);
    console.log("Definition du gaz Deco");
    deco.addDecoGas("Nx50", 0.5, 0);
    console.log("Descente a 50 avec le Tx");
    deco.addDepthChange(0, 50, "Tx2135", 50 / 20);
    console.log("On fait une plongee de 25 min");
    deco.addFlat(50, "Tx2135", 25);
    console.log("Calcul de la deco...");
    var runtime = deco.calculateDecompression(false, 0.5, 0.7, 1.6, 30, undefined);
    console.log("Resultat de la deco :");
    console.log(runtime);
    setRuntime(runtime);
    setShowTableau(true);
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
              <View>
                <Text style={mainStyles.text}>{appJson.expo.name} est un outil pédagogique pour l'apprentissage des GF sur l'algorithme de Bühlmann ZHL16-C</Text>
                <Text style={mainStyles.attentionText}>ATTENTION !!! Il ne faut pas considérer que les runtimes générés sont qualifés pour plonger</Text>
              </View>
              {showTableau && <TableauJSON data={runtime} />}
            </View>
            <View style={mainStyles.buttonContainer}>
              <CircleButton onPress={() => setShowAbout(true)} iconName="help" position={'Left'} />
              {!showTableau && <CircleButton onPress={() => computeDive()} iconName="palmes" position={'Right'} />}
              {showTableau && <CircleButton onPress={() => setShowTableau(false)} iconName="clear" position={'Right'} />}
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
