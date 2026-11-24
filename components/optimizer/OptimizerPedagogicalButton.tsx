// components/optimizer/OptimizerPedagogicalButton.tsx
// Ouvre le résultat de l'optimisation dans le mode pédagogique (rejeu des tissus, comparaison de GF).
import { router } from 'expo-router';
import { useMemo } from 'react';

import { computeRuntime, tanksFromCriteria, type DiveDefinition, type OptimizerCriteria } from '../../lib/dive';
import { ROUTES } from '../../navigation/types';
import { usePedagogicalStore } from '../../store/usePedagogicalStore';
import { PedagogicalLaunchButton } from '../PedagogicalLaunchButton';

type Props = { definition: DiveDefinition; criteria: OptimizerCriteria; planName: string };

export default function OptimizerPedagogicalButton({ definition, criteria, planName }: Props) {
    const { setPlans } = usePedagogicalStore();
    const { plan } = useMemo(() => computeRuntime(definition), [definition]);
    const tanks = useMemo(() => tanksFromCriteria(criteria), [criteria]);

    return (
        // Le formulaire pédagogique ne lit ses blocs qu'à sa création : on le recrée si le résultat change.
        <PedagogicalLaunchButton
            key={`${planName}|${JSON.stringify(tanks)}|${definition.gfLow}|${definition.gfHigh}`}
            plan={plan}
            planName={planName}
            currentGfLow={definition.gfLow}
            currentGfHigh={definition.gfHigh}
            definition={definition}
            initialTanks={tanks}
            variant="button"
            onLaunch={(planA, planB) => {
                setPlans(planA, planB);
                router.push(ROUTES.PEDAGOGICAL);
            }}
        />
    );
}
