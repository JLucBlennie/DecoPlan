import { Image, StyleSheet, Text, View } from 'react-native';
import appJson from '../app.json';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

export default function AboutScreen() {

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
        </View>
        <View style={styles.headerTexts}>
          <Text style={styles.appName}>{appJson.expo.name}</Text>
          <Text style={styles.appVersion}>by JLuc · v{appJson.expo.version}</Text>
          <Text style={styles.text}>({appJson.expo.name}) est basé sur les travaux de l'équipe de MV-Plan et de github.com/nyxtom/dive</Text>
        </View>
      </View>
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>{appJson.expo.name} est un outil pédagogique pour l'apprentissage des GF sur l'algorithme de Bühlmann ZHL16-C</Text>
        <Text style={styles.disclaimerText}>ATTENTION !!! Il ne faut pas considérer que les runtimes générés sont qualifés pour plonger</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Écran
  screen: {
    flex: 1,
    backgroundColor: ocean.bg.deep,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignSelf: 'stretch',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ocean.border.subtle,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: ocean.soft.blue,
    borderWidth: 1,
    borderColor: ocean.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  appName: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: ocean.text.primary,
    letterSpacing: 0.3,
  },
  appVersion: {
    fontSize: fontSize.xs,
    color: ocean.text.muted,
    marginTop: 2,
  },
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
  // Disclaimer
  disclaimer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: ocean.soft.amber,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: ocean.accent.amber,
    marginTop: spacing.xs,
  },
  disclaimerText: {
    fontSize: fontSize.xs,
    color: ocean.accent.amber,
    textAlign: 'center',
  },
  text: {
    fontSize: fontSize.xs,
    color: ocean.text.muted,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginBottom: spacing.xs,
  },
  logo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
});
