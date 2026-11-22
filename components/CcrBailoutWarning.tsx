// components/CcrBailoutWarning.tsx
// Avertissement à la création d'une plongée en recycleur : bail-out absent, ou aucun gaz
// de bail-out respirable à la profondeur maximale de la plongée (ppO₂ / END).
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BAILOUT_LIMITS, bailoutProblem, type Gas, type Segment } from '../lib/dive';
import { fontSize, spacing } from '../styles/theme';

type Props = {
  /** Nom du diluant : `undefined` = circuit ouvert, rien à vérifier. */
  diluentName: string | undefined;
  /** Gaz de déco sélectionnés : ils servent de gaz de bail-out. */
  gazDeco: Gas[];
  /** Segments saisis (profondeur maximale = profondeur de bail-out la plus défavorable). */
  segments: Segment[];
};

export default function CcrBailoutWarning({ diluentName, gazDeco, segments }: Props) {
  const message = useMemo(() => {
    if (diluentName === undefined) return undefined;
    const deepest = Math.max(0, ...segments.flatMap(s => [s.startDepth, s.endDepth]));
    return bailoutProblem(gazDeco, deepest, BAILOUT_LIMITS);
  }, [diluentName, gazDeco, segments]);

  if (!message) return null;

  return (
    <View style={styles.row}>
      <MaterialIcons name="warning" size={14} color="#BA7517" />
      <Text style={styles.txt}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.sm },
  txt: { flex: 1, fontSize: fontSize.xs, color: '#BA7517' },
});
