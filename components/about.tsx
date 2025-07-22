import { ImageBackground, Text, TextInput, View, StyleSheet, Linking } from 'react-native';
import appJson from '../app.json';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {

  return (
    <View style={styles.aboutcontainer}>
      <MaterialCommunityIcons name="diving-scuba" size={38} color="#0428f1ff" />
      <Text style={styles.text}>Version de l'application</Text>
      <Text style={styles.text}>({appJson.expo.name}) by JLuc - V{appJson.expo.version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#0428f1ff',
  },
  aboutcontainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    width: '100%'
  }
});
