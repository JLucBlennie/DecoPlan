import { ImageBackground, Text, TextInput, View, StyleSheet, Linking } from 'react-native';
import appJson from '../app.json';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CircleButton from './ui/CircleButton';
import { mainStyles } from '../App';

type Props = {
  close: () => void;
};

export default function AboutScreen({ close }: Props) {

  return (
    <View style={styles.aboutcontainer}>
      <View style={styles.aboutcontainerdesc}>
        <View>
          <View style={styles.circleButtonContainer}>
            <View style={styles.circleButton}>
              <MaterialCommunityIcons name="diving-scuba" size={38} color="#0428f1ff" />
            </View>
          </View>
        </View>
        <View style={styles.descContainer}>
          <Text style={mainStyles.text}>Version de l'application</Text>
          <Text style={mainStyles.text}>({appJson.expo.name}) by JLuc - V{appJson.expo.version}</Text>
        </View>
        <View style={styles.disclaimerContainer}>
          <Text style={mainStyles.text}>{appJson.expo.name} est un outil pédagogique pour l'apprentissage des GF sur l'algorithme de Bühlmann ZHL16-C</Text>
          <Text style={mainStyles.attentionText}>ATTENTION !!! Il ne faut pas considérer que les runtimes générés sont qualifés pour plonger</Text>
        </View>
      </View>
      <View style={styles.exitbuttoncontainer}>
        <View style={styles.buttonContainer}>
          <CircleButton onPress={close} iconName="clear" position={'Right'} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aboutcontainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  aboutcontainerdesc: {
    flex: 6 / 7,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    width: '100%',
    padding: 5
  },
  circleButtonContainer: {
    width: 84,
    height: 84,
    borderWidth: 4,
    borderColor: '#022353ff',
    borderRadius: 42,
    padding: 3,
  },
  circleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 42,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingLeft: 200
  },
  exitbuttoncontainer: {
    flex: 1 / 7,
    backgroundColor: 'transparent',
    paddingBottom: 20,
    width: '100%'
  },
  descContainer: {
    flex: 3 / 5,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 10
  },
  disclaimerContainer: {
    flex: 2 / 5,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  }
});
