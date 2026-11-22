// components/CcrBailoutWarning.tsx
// Avertissement à la création d'une plongée en recycleur : bail-out absent, ou aucun gaz
// de bail-out respirable à la profondeur maximale de la plongée (ppO₂ / END).
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { bailoutLimitsFor, bailoutProblem, type Gas, type Segment } from '../lib/dive';
import { usePreferencesStore } from '../store/usePreferencesStore';
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
  const ccrBailoutMaxEndM = usePreferencesStore(s => s.ccrBailoutMaxEndM);
  const message = useMemo(() => {
    if (diluentName === undefined) return undefined;
    const deepest = Math.max(0, ...segments.flatMap(s => [s.startDepth, s.endDepth]));
    return bailoutProblem(gazDeco, deepest, bailoutLimitsFor(ccrBailoutMaxEndM));
  }, [diluentName, gazDeco, segments, ccrBailoutMaxEndM]);

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
