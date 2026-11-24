// components/optimizer/OptimizerPedagogicalButton.tsx
// Ouvre le résultat de l'optimisation dans le mode pédagogique (rejeu des tissus, comparaison de GF).
import { router } from 'expo-router';
import { useMemo } from 'react';

import { computeRuntime, type DiveDefinition } from '../../lib/dive';
import { ROUTES } from '../../navigation/types';
import { usePedagogicalStore } from '../../store/usePedagogicalStore';
import { PedagogicalLaunchButton } from '../PedagogicalLaunchButton';

type Props = { definition: DiveDefinition; planName: string };

export default function OptimizerPedagogicalButton({ definition, planName }: Props) {
    const { setPlans } = usePedagogicalStore();
    const { plan } = useMemo(() => computeRuntime(definition), [definition]);

    return (
        <PedagogicalLaunchButton
            plan={plan}
            planName={planName}
            currentGfLow={definition.gfLow}
            currentGfHigh={definition.gfHigh}
            definition={definition}
            variant="button"
            onLaunch={(planA, planB) => {
                setPlans(planA, planB);
                router.push(ROUTES.PEDAGOGICAL);
            }}
        />
    );
}
