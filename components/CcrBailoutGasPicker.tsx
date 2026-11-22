// components/CcrBailoutGasPicker.tsx
// Plongée en recycleur : choix des gaz de bail-out parmi les gaz de la gestion des gaz.
// Sans choix, les gaz de déco de la plongée servent de bail-out.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { Gas } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

type Props = {
  /** Nom du diluant : `undefined` = circuit ouvert, le sélecteur n'apparaît pas. */
  diluentName: string | undefined;
  /** Tous les gaz de la gestion des gaz. */
  gazList: Gas[];
  /** Gaz de bail-out choisis. */
  selected: Gas[];
  onChange: (selected: Gas[]) => void;
  /** Gaz de déco de la plongée (bail-out par défaut). */
  gazDeco: Gas[];
};

export default function CcrBailoutGasPicker({ diluentName, gazList, selected, onChange, gazDeco }: Props) {
  if (diluentName === undefined) return null;

  const toggle = (gas: Gas) => {
    onChange(
      selected.some(g => g.id === gas.id)
        ? selected.filter(g => g.id !== gas.id)
        : [...selected, gas],
    );
  };

  const usesDefault = selected.length === 0;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Gaz de bail-out</Text>
      <Text style={styles.hint}>
        {usesDefault
          ? gazDeco.length > 0
            ? `Par défaut : gaz de déco (${gazDeco.map(g => g.name).join(', ')})`
            : 'Aucun choix : les gaz de déco serviront de bail-out'
          : `Bail-out : ${selected.map(g => g.name).join(', ')}`}
      </Text>

      {gazList.length === 0 ? (
        <Text style={styles.hint}>Aucun gaz configuré</Text>
      ) : (
        gazList.map(gas => {
          const checked = selected.some(g => g.id === gas.id);
          return (
            <TouchableOpacity key={gas.id} style={styles.item} onPress={() => toggle(gas)} activeOpacity={0.7}>
              <MaterialIcons
                name={checked ? 'check-box' : 'check-box-outline-blank'}
                size={20}
                color={checked ? ocean.accent.blue : ocean.border.subtle}
              />
              <Text style={[styles.name, checked && styles.nameSelected]}>{gas.name}</Text>
              <Text style={styles.compo}>
                O₂ {Math.round(gas.fO2 * 100)}%{gas.fHe > 0 ? `  He ${Math.round(gas.fHe * 100)}%` : ''}
              </Text>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: ocean.bg.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  title: { fontSize: fontSize.sm, fontWeight: '600', color: ocean.text.primary },
  hint: { fontSize: fontSize.xs, color: ocean.text.muted },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  name: { fontSize: fontSize.sm, color: ocean.text.secondary },
  nameSelected: { color: ocean.text.primary, fontWeight: '600' },
  compo: { fontSize: fontSize.xs, color: ocean.text.muted },
});
