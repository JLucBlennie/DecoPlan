import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import uuid from 'react-native-uuid';

import { Gas, Segment } from '../lib/dive';
import { useGazStore } from '../store/useGazStore';
import { usePlongeeStore } from '../store/usePlongeeStore';
import { sharedStyles } from '../styles/sharedStyles';
import { fontSize, ocean, radius, spacing } from '../styles/theme';
import PlongeeProfileGraph from './PlongeeProfileGraph';
import CircleButton from './ui/CircleButton';

export default function AddPlongeeForm() {
  const { gazList } = useGazStore();
  const { addPlongee } = usePlongeeStore();

  const [nom, setNom] = useState('');
  const [gazFond, setGazFond] = useState<Gas[]>([]);
  const [gazDeco, setGazDeco] = useState<Gas[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);

  // id stable pour toute la durée du formulaire
  const [plongeeId] = useState<string>(() => uuid.v4() as string);

  // ── Soumission ─────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    addPlongee({ id: plongeeId, name: nom, gazFond, gazDeco, segments });
    router.back();
  };

  // ── Sélection des gaz ──────────────────────────────────────────────────────
  const toggleGaz = (
    gaz: Gas,
    selected: Gas[],
    setSelected: React.Dispatch<React.SetStateAction<Gas[]>>,
  ) => {
    setSelected(prev =>
      prev.some(g => g.id === gaz.id)
        ? prev.filter(g => g.id !== gaz.id)
        : [...prev, gaz],
    );
  };

  // Checkbox custom cross-platform — MaterialIcons fonctionne web + natif
  const renderGazItem = (
    gaz: Gas,
    selected: Gas[],
    setSelected: React.Dispatch<React.SetStateAction<Gas[]>>,
  ) => {
    const checked = selected.some(g => g.id === gaz.id);
    return (
      <TouchableOpacity
        key={gaz.id}
        style={styles.gazItem}
        onPress={() => toggleGaz(gaz, selected, setSelected)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={checked ? 'check-box' : 'check-box-outline-blank'}
          size={20}
          color={checked ? ocean.accent.blue : ocean.border.subtle}
        />
        <View style={styles.gazItemInfo}>
          <Text style={[styles.gazName, checked && styles.gazNameSelected]}>
            {gaz.name}
          </Text>
          <Text style={styles.gazCompo}>
            O₂ {Math.round(gaz.fO2 * 100)}%
            {gaz.fHe > 0 ? `  He ${Math.round(gaz.fHe * 100)}%` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >

      {/* Nom */}
      <Text style={sharedStyles.sectionLabel}>Nom de la plongée</Text>
      <TextInput
        style={styles.input}
        value={nom}
        onChangeText={setNom}
        placeholder="Ex : Tombant de Marseille"
        placeholderTextColor={ocean.text.muted}
        autoCapitalize="sentences"
      />

      {/* Sélection des gaz */}
      <View style={styles.gazLists}>

        <View style={styles.gazListSection}>
          <View style={styles.gazListHeader}>
            <Text style={styles.gazListTitle}>Gaz fond</Text>
            {gazFond.length > 0 && (
              <View style={styles.gazCount}>
                <Text style={styles.gazCountTxt}>{gazFond.length}</Text>
              </View>
            )}
          </View>
          {gazList.length === 0
            ? <Text style={styles.emptyGaz}>Aucun gaz configuré</Text>
            : gazList.map(g => renderGazItem(g, gazFond, setGazFond))
          }
        </View>

        <View style={styles.gazListDivider} />

        <View style={styles.gazListSection}>
          <View style={styles.gazListHeader}>
            <Text style={styles.gazListTitle}>Gaz déco</Text>
            {gazDeco.length > 0 && (
              <View style={[styles.gazCount, styles.gazCountDeco]}>
                <Text style={[styles.gazCountTxt, styles.gazCountTxtDeco]}>{gazDeco.length}</Text>
              </View>
            )}
          </View>
          {gazList.length === 0
            ? <Text style={styles.emptyGaz}>Aucun gaz configuré</Text>
            : gazList.map(g => renderGazItem(g, gazDeco, setGazDeco))
          }
        </View>

      </View>

      {/* Profil */}
      <Text style={[sharedStyles.sectionLabel, { marginTop: spacing.md }]}>
        Profil de plongée
      </Text>
      <PlongeeProfileGraph
        segments={segments}
        gazFondList={gazFond}
        onSegmentsChange={setSegments}
      />

      {/* Valider */}
      <View style={styles.buttons}>
        <CircleButton iconName="check" onPress={handleSubmit} position="Right" />
      </View>

    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },

  input: {
    alignSelf: 'stretch',
    backgroundColor: ocean.bg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ocean.border.subtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: ocean.text.primary,
    marginBottom: spacing.sm,
  },

  gazLists: {
    flexDirection: 'row',
    backgroundColor: ocean.bg.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ocean.border.subtle,
    overflow: 'hidden',
  },
  gazListSection: { flex: 1, padding: spacing.sm },
  gazListDivider: { width: StyleSheet.hairlineWidth, backgroundColor: ocean.border.subtle },
  gazListHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  gazListTitle: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.secondary },

  gazCount: {
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: radius.full, backgroundColor: ocean.soft.blue,
  },
  gazCountDeco: { backgroundColor: 'rgba(29,158,117,0.15)' },
  gazCountTxt: { fontSize: 10, fontWeight: '600', color: ocean.accent.blue },
  gazCountTxtDeco: { color: ocean.accent.teal },
  emptyGaz: { fontSize: fontSize.xs, color: ocean.text.muted, fontStyle: 'italic' },

  gazItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ocean.border.subtle,
  },
  gazItemInfo: { flex: 1 },
  gazName: { fontSize: fontSize.sm, color: ocean.text.secondary },
  gazNameSelected: { color: ocean.text.primary, fontWeight: '500' },
  gazCompo: { fontSize: fontSize.xs, color: ocean.text.muted, marginTop: 1 },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
});
