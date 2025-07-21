import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import appJson from './app.json';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function App() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="diving-scuba" size={38} color="#ffd33d" />
      <Text>{appJson.expo.name} - Open up App.tsx to start working on your app! </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
