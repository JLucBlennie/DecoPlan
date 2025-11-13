import { Text, View, StyleSheet } from 'react-native';
import appJson from '../app.json';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { mainStyles } from '../styles/mainStyles';

export default function AboutScreen() {

  return (
    <View style={mainStyles.editorContainer}>
      <View style={styles.circleButtonContainer}>
        <View style={styles.circleButton}>
          <MaterialCommunityIcons name="diving-scuba" size={38} color="#0428f1ff" />
        </View>
      </View>
      <View style={styles.descContainer}>
        <Text style={mainStyles.text}>Version de l'application</Text>
        <Text style={mainStyles.text}>({appJson.expo.name}) by JLuc - V{appJson.expo.version}</Text>
        <Text style={mainStyles.text}>({appJson.expo.name}) est basé sur les travaux de l'équipe de MV-Plan et de github.com/nyxtom/dive</Text>
      </View>
      <View style={styles.disclaimerContainer}>
        <Text style={mainStyles.text}>{appJson.expo.name} est un outil pédagogique pour l'apprentissage des GF sur l'algorithme de Bühlmann ZHL16-C</Text>
        <Text style={mainStyles.attentionText}>ATTENTION !!! Il ne faut pas considérer que les runtimes générés sont qualifés pour plonger</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circleButtonContainer: {
    width: 84,
    height: 84,
    borderWidth: 4,
    borderColor: '#022353ff',
    borderRadius: 42,
    padding: 10,
  },
  circleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 42,
    backgroundColor: '#fff',
  },
  descContainer: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 20
  },
  disclaimerContainer: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  }
});
