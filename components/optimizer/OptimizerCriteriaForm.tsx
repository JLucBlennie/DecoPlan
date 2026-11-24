// components/optimizer/OptimizerCriteriaForm.tsx
// Saisie des critères : profondeur, gaz, blocs, réserves et limites facultatives.
import { StyleSheet, Text, View } from 'react-native';

import type { Gas } from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import NumberStepper from '../ui/NumberStepper';
import OptimizerBlocksSection from './OptimizerBlocksSection';
import OptionalLimit from './OptionalLimit';
import type { OptimizerDraft } from './optimizerDraft';
import OptimizerGasSection from './OptimizerGasSection';

type Props = {
    draft: OptimizerDraft;
    gases: Gas[];
    onChange: (patch: Partial<OptimizerDraft>) => void;
    onAddCustomGas: (gas: Gas) => void;
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            {children}
        </View>
    );
}

export default function OptimizerCriteriaForm({ draft, gases, onChange, onAddCustomGas }: Props) {
    return (
        <View style={styles.root}>
            <Card title="Plongée visée">
                <NumberStepper label="Profondeur" value={draft.depthM} min={10} max={120} unit="m"
                    onChange={depthM => onChange({ depthM })} />
            </Card>

            <Card title="Gaz">
                <OptimizerGasSection
                    gases={gases}
                    bottomId={draft.bottomId}
                    decoIds={draft.decoIds}
                    onSelectBottom={bottomId => onChange({ bottomId })}
                    onToggleDeco={id => onChange({
                        decoIds: draft.decoIds.includes(id) ? draft.decoIds.filter(d => d !== id) : [...draft.decoIds, id],
                    })}
                    onAddCustom={onAddCustomGas}
                />
            </Card>

            <Card title="Blocs">
                <OptimizerBlocksSection
                    draft={draft}
                    bottomGas={gases.find(g => g.id === draft.bottomId)}
                    decoGases={gases.filter(g => draft.decoIds.includes(g.id))}
                    onChange={onChange}
                />
            </Card>

            <Card title="Réserves (par bloc)">
                <NumberStepper label="Gaz de fond" value={draft.reserves.bottomBar} min={0} max={100} step={5} unit="bar"
                    onChange={bottomBar => onChange({ reserves: { ...draft.reserves, bottomBar } })} />
                <NumberStepper label="Gaz de déco" value={draft.reserves.decoBar} min={0} max={100} step={5} unit="bar"
                    onChange={decoBar => onChange({ reserves: { ...draft.reserves, decoBar } })} />
            </Card>

            <Card title="Limites facultatives">
                <OptionalLimit label="Durée de déco maximale" unit="min" value={draft.maxDecoTimeMin}
                    defaultValue={30} min={1} max={240} step={5}
                    onChange={maxDecoTimeMin => onChange({ maxDecoTimeMin })} />
                <OptionalLimit label="Profondeur max du 1er palier" unit="m" value={draft.maxFirstStopDepthM}
                    defaultValue={21} min={3} max={60} step={3}
                    onChange={maxFirstStopDepthM => onChange({ maxFirstStopDepthM })} />
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { alignSelf: 'stretch', gap: spacing.sm },
    card: {
        alignSelf: 'stretch', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md,
        backgroundColor: ocean.bg.surface, borderWidth: 0.5, borderColor: ocean.border.subtle,
    },
    cardTitle: {
        fontSize: fontSize.xs, fontWeight: '600', color: ocean.text.muted,
        textTransform: 'uppercase', letterSpacing: 0.4,
    },
});
