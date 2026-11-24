// components/optimizer/BlockSpecEditor.tsx
// Type de bloc : volume (touches rapides), pression de gonflage et nombre de blocs.
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { BlockSpec } from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import NumberStepper from '../ui/NumberStepper';

const QUICK_VOLUMES = [7, 10, 12, 15, 18];

type Props = { title: string; block: BlockSpec; onChange: (block: BlockSpec) => void };

export default function BlockSpecEditor({ title, block, onChange }: Props) {
    return (
        <View style={styles.root}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.volumes}>
                {QUICK_VOLUMES.map(v => (
                    <TouchableOpacity
                        key={v}
                        style={[styles.chip, block.volumeL === v && styles.chipOn]}
                        onPress={() => onChange({ ...block, volumeL: v })}
                    >
                        <Text style={[styles.chipTxt, block.volumeL === v && styles.chipTxtOn]}>{v} L</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <NumberStepper label="Pression de gonflage" value={block.pressureBar} min={100} max={300} step={10}
                unit="bar" onChange={pressureBar => onChange({ ...block, pressureBar })} />
            <NumberStepper label="Nombre de blocs" value={block.count} min={1} max={6}
                onChange={count => onChange({ ...block, count })} />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: spacing.xs },
    title: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
    volumes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    chip: {
        paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.sm,
        borderWidth: 0.5, borderColor: ocean.border.subtle, backgroundColor: ocean.bg.surface,
    },
    chipOn: { borderColor: ocean.accent.blue, backgroundColor: 'rgba(55,138,221,0.15)' },
    chipTxt: { fontSize: fontSize.xs, color: ocean.text.secondary },
    chipTxtOn: { color: ocean.accent.blue, fontWeight: '600' },
});
