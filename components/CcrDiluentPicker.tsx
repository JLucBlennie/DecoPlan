// components/CcrDiluentPicker.tsx
// Interrupteur « Recycleur » + choix du diluant parmi les gaz de fond de la plongée.
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import type { Gas } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

type Props = {
  gazFond: Gas[];
  /** Nom du diluant, `undefined` = circuit ouvert. */
  diluentName: string | undefined;
  onChange: (diluentName: string | undefined) => void;
};

export default function CcrDiluentPicker({ gazFond, diluentName, onChange }: Props) {
  const enabled = diluentName !== undefined;

  const handleToggle = (value: boolean) => {
    onChange(value ? gazFond[0]?.name ?? '' : undefined);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.title}>Recycleur (CCR)</Text>
          <Text style={styles.hint}>Set points et diluant, avec bail-out calculé en « Et si »</Text>
        </View>
        <Switch value={enabled} onValueChange={handleToggle} />
      </View>

      {enabled && (
        gazFond.length === 0 ? (
          <Text style={styles.warn}>Sélectionnez d'abord un gaz de fond : il servira de diluant.</Text>
        ) : (
          <View style={styles.chips}>
            <Text style={styles.chipsLabel}>Diluant</Text>
            {gazFond.map(g => {
              const active = g.name === diluentName;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => onChange(g.name)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{g.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: ocean.bg.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowText: { flex: 1 },
  title: { fontSize: fontSize.sm, fontWeight: '600', color: ocean.text.primary },
  hint: { fontSize: fontSize.xs, color: ocean.text.muted },
  warn: { fontSize: fontSize.xs, color: '#BA7517', marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  chipsLabel: { fontSize: fontSize.xs, color: ocean.text.muted, marginRight: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.md, borderWidth: 1, borderColor: ocean.text.muted,
  },
  chipActive: { backgroundColor: ocean.accent.blue, borderColor: ocean.accent.blue },
  chipTxt: { fontSize: fontSize.xs, color: ocean.text.primary },
  chipTxtActive: { color: ocean.bg.deep, fontWeight: '600' },
});

/** Diluant à enregistrer : `undefined` si CCR désactivé ou si le diluant n'est plus un gaz de fond. */
export function validDiluent(gazFond: Gas[], diluentName: string | undefined): string | undefined {
  if (diluentName === undefined) return undefined;
  return gazFond.some(g => g.name === diluentName) ? diluentName : undefined;
}
