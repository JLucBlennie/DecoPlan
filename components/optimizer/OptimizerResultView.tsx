// components/optimizer/OptimizerResultView.tsx
// Résultat : temps de fond optimal, ce qui le limite, gaz, puis runtimes (détail et « Et si ? »).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRuntimeSelection } from '../../hooks/useRuntimeSelection';
import type { OptimizerCriteria, OptimizerResult, WhatIfResult } from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import SegmentedToggle from '../SegmentedToggle';
import WhatIfColumns from '../WhatIfColumns';
import WhatIfProfileChart from '../WhatIfProfileChart';
import GasBudgetList from './GasBudgetList';
import { limitingText } from './limitingText';
import OptimizerPedagogicalButton from './OptimizerPedagogicalButton';

type View_ = 'detail' | 'whatIf';
const VIEWS: { value: View_; label: string }[] = [
    { value: 'whatIf', label: 'Les runtimes avec les What if ?' },
];

type Props = { result: OptimizerResult; whatIf: WhatIfResult, criteria: OptimizerCriteria, planName: string };

export default function OptimizerResultView({ result, whatIf, criteria, planName }: Props) {
    const [view, setView] = useState<View_>('whatIf');
    const { selectedKind, select } = useRuntimeSelection(whatIf);
    const { evaluation } = result;
    const reserves = evaluation.definition.gasReserves ?? { bottomBar: 0, decoBar: 0 };

    return (
        <View style={styles.root}>
            {result.feasible ? (
                <View style={styles.headline}>
                    <Text style={styles.time}>{evaluation.bottomTimeMin} min de fond</Text>
                    <Text style={styles.sub}>
                        Limité par {result.limiting.map(limitingText).join(' et ')}.
                    </Text>
                    <Text style={styles.sub}>
                        Déco {Math.round(evaluation.summary.decoTimeMin)} min · 1er palier {evaluation.summary.firstStopDepthM} m
                        · durée totale {Math.round(evaluation.summary.totalTimeMin)} min
                    </Text>
                </View>
            ) : (
                <View style={[styles.headline, styles.headlineKo]}>
                    <Text style={styles.timeKo}>Aucun temps de fond ne convient</Text>
                    <Text style={styles.sub}>
                        Même 1 min dépasse : {result.limiting.map(limitingText).join(', ')}. Change les blocs, les gaz ou les limites.
                    </Text>
                </View>
            )}

            <GasBudgetList budgets={evaluation.budgets} reserves={reserves} />

            <WhatIfProfileChart result={whatIf} selectedKind={selectedKind} onSelect={select} />
            <View style={styles.toolbar}>
                <View style={styles.toggle}>
                    <SegmentedToggle value={view} options={VIEWS} onChange={setView} disabled={true} />
                </View>
                {whatIf && result.feasible && (
                    <OptimizerPedagogicalButton
                        definition={result.evaluation.definition} criteria={criteria} planName={planName}
                    />
                )}
            </View>

            <WhatIfColumns result={whatIf} selectedKind={selectedKind} onSelect={select} />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { alignSelf: 'stretch', gap: spacing.sm },
    headline: {
        gap: 2, padding: spacing.md, borderRadius: radius.md,
        backgroundColor: 'rgba(29,158,117,0.12)', borderWidth: 0.5, borderColor: ocean.accent.teal,
    },
    headlineKo: { backgroundColor: 'rgba(226,75,74,0.12)', borderColor: ocean.accent.red },
    time: { fontSize: fontSize.lg, fontWeight: '600', color: ocean.accent.teal },
    timeKo: { fontSize: fontSize.md, fontWeight: '600', color: ocean.accent.red },
    sub: { fontSize: fontSize.xs, color: ocean.text.secondary },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: spacing.sm,
    },
    toggle: {
        flex: 1,
    },
});
