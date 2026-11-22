// components/CcrDiluentAdvice.tsx
// Plongée en recycleur : contrôle du diluant choisi (ppO₂ vs set point haut, narcose, hypoxie)
// à la profondeur max de la plongée, avec un mélange conseillé si besoin.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { diluentAdvice, diluentLimitsFor, Gas, type Segment } from '../lib/dive';
import { useGazStore } from '../store/useGazStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

type Props = {
  /** Nom du diluant : `undefined` = circuit ouvert, rien à vérifier. */
  diluentName: string | undefined;
  gazFond: Gas[];
  segments: Segment[];
};

export default function CcrDiluentAdvice({ diluentName, gazFond, segments }: Props) {
  const setpointHigh = usePreferencesStore(s => s.ccrSetpointHigh);
  const { gazList, addGaz } = useGazStore();

  const advice = useMemo(() => {
    const diluent = diluentName === undefined ? undefined : gazFond.find(g => g.name === diluentName);
    if (!diluent) return undefined;
    const deepest = Math.max(0, ...segments.flatMap(s => [s.startDepth, s.endDepth]));
    return diluentAdvice(diluent, deepest, diluentLimitsFor(setpointHigh));
  }, [diluentName, gazFond, segments, setpointHigh]);

  if (!advice || (advice.messages.length === 0 && !advice.suggestion)) return null;

  const suggestion = advice.suggestion;
  // Le mélange conseillé est-il déjà dans la liste des gaz (même composition) ?
  const alreadyExists = suggestion !== undefined && gazList.some(
    g => Math.round(g.fO2 * 100) === suggestion.o2Percent && Math.round(g.fHe * 100) === suggestion.hePercent,
  );
  const createSuggestion = () => {
    if (!suggestion) return;
    addGaz(Gas.create(suggestion.name, suggestion.o2Percent / 100, suggestion.hePercent / 100));
  };

  return (
    <View style={styles.wrapper}>
      {advice.messages.map(m => (
        <View key={m.text} style={styles.row}>
          <MaterialIcons
            name={m.level === 'warning' ? 'warning' : 'info-outline'}
            size={14}
            color={m.level === 'warning' ? '#BA7517' : ocean.text.muted}
          />
          <Text style={[styles.txt, m.level === 'warning' ? styles.warn : styles.info]}>{m.text}</Text>
        </View>
      ))}
      {advice.suggestion && (
        <View style={styles.row}>
          <MaterialIcons name="lightbulb-outline" size={14} color={ocean.accent.blue} />
          <Text style={[styles.txt, { color: ocean.accent.blue }]}>
            Mélange conseillé : {advice.suggestion.name} (O₂ {advice.suggestion.o2Percent} %, He {advice.suggestion.hePercent} %).
            {alreadyExists
              ? 'Ce mélange est déjà dans votre liste de gaz : ajoutez-le aux gaz de fond et choisissez-le comme diluant.'
              : 'Conseil indicatif, à vérifier avant la plongée.'}
          </Text>
        </View>
      )}
      {suggestion && !alreadyExists && (
        <TouchableOpacity style={styles.button} onPress={createSuggestion} activeOpacity={0.7}>
          <MaterialIcons name="add" size={16} color={ocean.accent.blue} />
          <Text style={styles.buttonTxt}>Créer le gaz {suggestion.name} dans la liste des gaz</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: spacing.sm, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  txt: { flex: 1, fontSize: fontSize.xs },
  warn: { color: '#BA7517' },
  info: { color: ocean.text.muted },
  button: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
    borderWidth: 1, borderColor: ocean.accent.blue, borderRadius: radius.md,
  },
  buttonTxt: { fontSize: fontSize.xs, fontWeight: '600', color: ocean.accent.blue },
});
