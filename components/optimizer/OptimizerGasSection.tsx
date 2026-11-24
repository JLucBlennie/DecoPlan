// components/optimizer/OptimizerGasSection.tsx
// Choix du gaz de fond (un seul) et des gaz de déco (plusieurs), avec ajout d'un mélange libre.
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Gas } from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import NumberStepper from '../ui/NumberStepper';

type Props = {
    gases: Gas[];
    bottomId: string | null;
    decoIds: string[];
    onSelectBottom: (id: string) => void;
    onToggleDeco: (id: string) => void;
    /** Mélange libre : ajouté à la liste de cet écran seulement, pas à la gestion des gaz. */
    onAddCustom: (gas: Gas) => void;
};

/** « Nx40 », « Tx2135 » : même convention que les gaz par défaut de l'application. */
export function mixName(o2Percent: number, hePercent: number): string {
    return hePercent > 0 ? `Tx${o2Percent}${hePercent}` : `Nx${o2Percent}`;
}

function GasChips({ gases, isOn, onPress }: { gases: Gas[]; isOn: (id: string) => boolean; onPress: (id: string) => void }) {
    return (
        <View style={styles.chips}>
            {gases.map(g => (
                <TouchableOpacity key={g.id} style={[styles.chip, isOn(g.id) && styles.chipOn]} onPress={() => onPress(g.id)}>
                    <Text style={[styles.chipTxt, isOn(g.id) && styles.chipTxtOn]}>{g.name}</Text>
                    <Text style={styles.chipSub}>
                        O₂ {Math.round(g.fO2 * 100)}%{g.fHe > 0 ? ` He ${Math.round(g.fHe * 100)}%` : ''}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function OptimizerGasSection({ gases, bottomId, decoIds, onSelectBottom, onToggleDeco, onAddCustom }: Props) {
    const [o2, setO2] = useState(40);
    const [he, setHe] = useState(0);
    const [adding, setAdding] = useState(false);

    return (
        <View style={styles.root}>
            <Text style={styles.title}>Gaz de fond</Text>
            <GasChips gases={gases} isOn={id => id === bottomId} onPress={onSelectBottom} />

            <Text style={[styles.title, styles.spaced]}>Gaz de déco</Text>
            <GasChips gases={gases} isOn={id => decoIds.includes(id)} onPress={onToggleDeco} />

            <TouchableOpacity onPress={() => setAdding(a => !a)}>
                <Text style={styles.link}>{adding ? '− Fermer' : '+ Mélange libre'}</Text>
            </TouchableOpacity>
            {adding && (
                <View style={styles.custom}>
                    <NumberStepper label="O₂" value={o2} min={5} max={100} unit="%" onChange={setO2} />
                    <NumberStepper label="He" value={he} min={0} max={95} unit="%" onChange={setHe} />
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => {
                            onAddCustom(Gas.create(mixName(o2, he), o2 / 100, he / 100));
                            setAdding(false);
                        }}
                    >
                        <Text style={styles.addBtnTxt}>Ajouter {mixName(o2, he)}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: spacing.xs },
    title: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
    spaced: { marginTop: spacing.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    chip: {
        paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.sm,
        borderWidth: 0.5, borderColor: ocean.border.subtle, backgroundColor: ocean.bg.surface,
    },
    chipOn: { borderColor: ocean.accent.teal, backgroundColor: 'rgba(29,158,117,0.15)' },
    chipTxt: { fontSize: fontSize.sm, color: ocean.text.secondary },
    chipTxtOn: { color: ocean.accent.teal, fontWeight: '600' },
    chipSub: { fontSize: 9, color: ocean.text.muted },
    link: { fontSize: fontSize.xs, color: ocean.accent.blue, marginTop: spacing.xs },
    custom: { gap: spacing.xs, paddingTop: spacing.xs },
    addBtn: {
        alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm,
        backgroundColor: ocean.accent.blue,
    },
    addBtnTxt: { fontSize: fontSize.xs, color: ocean.bg.deep, fontWeight: '600' },
});
