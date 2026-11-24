// components/pedagogical/SimulationEditor.tsx
// Modifie les niveaux de la plongée choisie, pour simuler (la plongée enregistrée reste intacte).
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Gas, type Plongee, type Segment } from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import PlongeeProfileGraph from '../PlongeeProfileGraph';

type Props = {
    /** Plongée enregistrée, point de départ de la simulation. */
    original: Plongee;
    /** Niveaux simulés ; `null` = plongée d'origine, sans modification. */
    simulated: Segment[] | null;
    onChange: (segments: Segment[] | null) => void;
};

export default function SimulationEditor({ original, simulated, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const gazFond = useMemo(() => original.gazFond.map(Gas.fromJSON), [original.gazFond]);
    const isModified = simulated !== null;

    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.header} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
                <MaterialIcons name="tune" size={18} color={ocean.accent.blue} />
                <View style={styles.headerText}>
                    <Text style={styles.title}>Modifier la plongée pour simuler</Text>
                    <Text style={styles.subtitle}>
                        {isModified ? 'Simulation en cours : niveaux modifiés' : 'Profondeurs et durées des niveaux'}
                    </Text>
                </View>
                <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={22} color={ocean.text.secondary} />
            </TouchableOpacity>

            {open && (
                <View style={styles.body}>
                    <PlongeeProfileGraph
                        segments={simulated ?? original.segments}
                        gazFondList={gazFond}
                        onSegmentsChange={onChange}
                    />
                    <View style={styles.footer}>
                        <Text style={styles.note}>
                            Simulation uniquement : « {original.name} » n'est pas modifiée.
                        </Text>
                        {isModified && (
                            <TouchableOpacity style={styles.reset} onPress={() => onChange(null)}>
                                <MaterialIcons name="restore" size={14} color={ocean.accent.blue} />
                                <Text style={styles.resetTxt}>Revenir à la plongée d'origine</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        alignSelf: 'stretch', backgroundColor: ocean.bg.surface, borderRadius: radius.md,
        borderWidth: 0.5, borderColor: ocean.border.subtle, overflow: 'hidden',
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
    headerText: { flex: 1, gap: 2 },
    title: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
    subtitle: { fontSize: fontSize.xs, color: ocean.text.muted },
    body: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
    footer: { gap: spacing.xs },
    note: { fontSize: fontSize.xs, color: ocean.text.muted },
    reset: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
    resetTxt: { fontSize: fontSize.xs, color: ocean.accent.blue },
});
