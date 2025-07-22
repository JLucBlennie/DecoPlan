import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import appJson from './app.json';
import React, { useState } from 'react';
import AboutScreen from './components/about';
import CircleButton from './components/ui/CircleButton';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Buhlmann } from './lib/dive/buhlmann';
import { Dive } from './lib/dive/dive';
import TableauJSON from './components/ui/TableauJSON';

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [decoPlan, setDecoPlan] = useState<Dive.Segment[]>([]);

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
    var decoPlan = deco.calculateDecompression(false, 0.5, 0.7, 1.6, 30, undefined);
    console.log("Resultat de la deco :");
    console.log(decoPlan);
    setDecoPlan(decoPlan);
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/*<SystemBar style="dark" />*/}
      <SafeAreaView style={styles.container} edges={['top']}>
        {showAbout && <AboutScreen />}
        {!showAbout &&
          <View style={styles.mainView}>
            <View>
              <Text>{appJson.expo.name} - Open up App.tsx to start working on your app! </Text>
              <View style={styles.buttonContainer}>
                <CircleButton onPress={() => setShowAbout(true)} iconName="check" position={'Left'} />
                <CircleButton onPress={() => computeDive()} iconName="check" position={'Right'} />
              </View>
            </View>
            <TableauJSON data={decoPlan} />
          </View>
        }
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b4e3e98c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  mainView: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
