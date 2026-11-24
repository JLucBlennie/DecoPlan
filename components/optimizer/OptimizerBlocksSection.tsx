// components/optimizer/OptimizerBlocksSection.tsx
// Blocs emportés : une ligne par gaz (widget TankConfigRow du mode pédagogique) + nombre de blocs.
import { StyleSheet, Text, View } from 'react-native';

import type { BlockSpec, Gas } from '../../lib/dive';
import { fontSize, ocean } from '../../styles/theme';
import { TankConfigRow } from '../TankConfigRow';
import { DEFAULT_DECO_BLOCK, type OptimizerDraft } from './optimizerDraft';

type Props = {
    draft: OptimizerDraft;
    bottomGas: Gas | undefined;
    decoGases: Gas[];
    onChange: (patch: Partial<OptimizerDraft>) => void;
};

function BlockRow({ gas, role, block, onChange }: {
    gas: Gas; role: 'bottom' | 'deco'; block: BlockSpec; onChange: (block: BlockSpec) => void;
}) {
    return (
        <TankConfigRow
            gasLabel={gas.name}
            gasRole={role}
            tank={{ gasName: gas.name, volumeLiters: block.volumeL, startPressureBar: block.pressureBar }}
            onChange={t => onChange({ ...block, volumeL: t.volumeLiters, pressureBar: t.startPressureBar })}
            count={block.count}
            onCountChange={count => onChange({ ...block, count })}
        />
    );
}

export default function OptimizerBlocksSection({ draft, bottomGas, decoGases, onChange }: Props) {
    if (!bottomGas) return <Text style={styles.hint}>Choisis d'abord le gaz de fond.</Text>;
    return (
        <View>
            <BlockRow gas={bottomGas} role="bottom" block={draft.bottomBlock}
                onChange={bottomBlock => onChange({ bottomBlock })} />
            {decoGases.map(gas => (
                <BlockRow key={gas.id} gas={gas} role="deco" block={draft.decoBlocks[gas.id] ?? DEFAULT_DECO_BLOCK}
                    onChange={block => onChange({ decoBlocks: { ...draft.decoBlocks, [gas.id]: block } })} />
            ))}
            {decoGases.length === 0 && <Text style={styles.hint}>Aucun gaz de déco : la remontée se fait sur le gaz de fond.</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    hint: { fontSize: fontSize.xs, color: ocean.text.muted, paddingTop: 6 },
});
