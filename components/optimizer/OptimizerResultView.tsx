// components/optimizer/OptimizerResultView.tsx
// Résultat : temps de fond optimal, ce qui le limite, gaz, puis runtimes (détail et « Et si ? »).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { OptimizerResult, WhatIfResult } from '../../lib/dive';
import { fontSize, ocean, radius, spacing } from '../../styles/theme';
import RuntimeResult from '../RuntimeResult';
import SegmentedToggle from '../SegmentedToggle';
import WhatIfColumns from '../WhatIfColumns';
import WhatIfProfileChart from '../WhatIfProfileChart';
import { useRuntimeSelection } from '../../hooks/useRuntimeSelection';
import GasBudgetList from './GasBudgetList';
import { limitingText } from './limitingText';

type View_ = 'detail' | 'whatIf';
const VIEWS: { value: View_; label: string }[] = [
    { value: 'detail', label: 'Détail' },
    { value: 'whatIf', label: 'Et si ?' },
];

type Props = { result: OptimizerResult; whatIf: WhatIfResult };

export default function OptimizerResultView({ result, whatIf }: Props) {
    const [view, setView] = useState<View_>('detail');
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
            <SegmentedToggle value={view} options={VIEWS} onChange={setView} />
            {view === 'detail'
                ? <RuntimeResult data={whatIf.nominal.segments} gasNeeds={whatIf.nominal.gasNeeds} />
                : <WhatIfColumns result={whatIf} selectedKind={selectedKind} onSelect={select} />}
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
});
