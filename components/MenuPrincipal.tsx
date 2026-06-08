import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import appJson from '../app.json';
import { useEditeur } from '../context/EditeurContext';
import { ocean, spacing, radius, fontSize } from '../styles/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type MenuItem = {
  key: 'gaz' | 'plongee' | 'runtime' | 'about';
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  iconBg: string;
  variant?: 'default' | 'cta' | 'ghost';
};

// ─── Icônes ───────────────────────────────────────────────────────────────────

const GazIcon     = () => <MaterialCommunityIcons name="diving-scuba-tank" size={22} color={ocean.accent.blue} />;
const DiveIcon    = () => <MaterialIcons name="scuba-diving" size={22} color={ocean.accent.teal} />;
const RuntimeIcon = () => <MaterialIcons name="play-circle-outline" size={22} color={ocean.accent.green} />;
const AboutIcon   = () => <Entypo name="help" size={18} color={ocean.text.muted} />;

// ─── Données du menu ──────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'gaz',
    label: 'Gestion des gaz',
    sublabel: 'Nitrox, Trimix, Air…',
    icon: <GazIcon />,
    iconBg: ocean.soft.blue,
    variant: 'default',
  },
  {
    key: 'plongee',
    label: 'Gestion des plongées',
    sublabel: 'Profils, segments, gaz fond/déco',
    icon: <DiveIcon />,
    iconBg: ocean.soft.teal,
    variant: 'default',
  },
  {
    key: 'runtime',
    label: 'Calculer un runtime',
    sublabel: 'Bühlmann ZHL-16C · Gradient Factors',
    icon: <RuntimeIcon />,
    iconBg: ocean.soft.green,
    variant: 'cta',
  },
];

// ─── Composant ligne de menu ─────────────────────────────────────────────────

type MenuRowProps = {
  item: MenuItem;
  onPress: () => void;
};

function MenuRow({ item, onPress }: MenuRowProps) {
  const isCta = item.variant === 'cta';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        isCta && styles.rowCta,
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      {/* Icône */}
      <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
        {item.icon}
      </View>

      {/* Textes */}
      <View style={styles.rowTexts}>
        <Text
          style={[styles.rowLabel, isCta && styles.rowLabelCta]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        <Text style={styles.rowSublabel} numberOfLines={1}>
          {item.sublabel}
        </Text>
      </View>

      {/* Flèche */}
      <FontAwesome5
        name="chevron-right"
        size={12}
        color={isCta ? ocean.accent.green : ocean.text.muted}
        style={styles.arrow}
      />
    </Pressable>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function MenuPrincipal() {
  const { ouvrirEditeur } = useEditeur();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={ocean.bg.deep} />

      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="diving-scuba" size={28} color={ocean.accent.blue} />
        </View>
        <View style={styles.headerTexts}>
          <Text style={styles.appName}>{appJson.expo.name}</Text>
          <Text style={styles.appVersion}>by JLuc · v{appJson.expo.version}</Text>
        </View>
      </View>

      {/* Section principale */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>NAVIGATION</Text>

        {MENU_ITEMS.map((item) => (
          <MenuRow
            key={item.key}
            item={item}
            onPress={() => ouvrirEditeur(item.key)}
          />
        ))}
      </View>

      {/* Bouton About discret en bas */}
      <Pressable
        style={({ pressed }) => [styles.aboutBtn, pressed && styles.rowPressed]}
        onPress={() => ouvrirEditeur('about')}
        accessibilityRole="button"
        accessibilityLabel="À propos de l'application"
      >
        <AboutIcon />
        <Text style={styles.aboutLabel}>À propos…</Text>
      </Pressable>

      {/* Disclaimer de bas de page */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Outil pédagogique — ne pas utiliser pour plonger
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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

  // Section
  section: {
    flex: 1,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    color: ocean.text.muted,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginBottom: spacing.xs,
  },

  // Lignes de menu
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ocean.bg.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ocean.border.subtle,
    padding: spacing.md,
    gap: spacing.md,
  },
  rowCta: {
    borderColor: ocean.soft.green,
    backgroundColor: ocean.soft.green,
  },
  rowPressed: {
    opacity: 0.75,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTexts: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: fontSize.md,
    color: ocean.text.primary,
    fontWeight: '500',
  },
  rowLabelCta: {
    color: ocean.accent.green,
  },
  rowSublabel: {
    fontSize: fontSize.xs,
    color: ocean.text.secondary,
  },
  arrow: {
    marginLeft: spacing.xs,
  },

  // Bouton About
  aboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  aboutLabel: {
    fontSize: fontSize.sm,
    color: ocean.text.muted,
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
});
