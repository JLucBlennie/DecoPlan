// components/optimizer/optimizerDraft.ts
// Saisie en cours de l'écran d'optimisation (ids de gaz, pas encore les objets Gas).
import type { BlockSpec, GasReserves, OptimizerCriteria } from '../../lib/dive';
import type { Gas } from '../../lib/dive';

export interface OptimizerDraft {
    depthM: number;
    bottomId: string | null;
    decoIds: string[];
    bottomBlock: BlockSpec;
    /** Blocs de déco par id de gaz. */
    decoBlocks: Record<string, BlockSpec>;
    reserves: GasReserves;
    maxDecoTimeMin: number | undefined;
    maxFirstStopDepthM: number | undefined;
}

export const DEFAULT_DECO_BLOCK: BlockSpec = { volumeL: 7, pressureBar: 200, count: 1 };

export function initialDraft(reserves: GasReserves): OptimizerDraft {
    return {
        depthM: 45,
        bottomId: null,
        decoIds: [],
        bottomBlock: { volumeL: 15, pressureBar: 200, count: 1 },
        decoBlocks: {},
        reserves,
        maxDecoTimeMin: undefined,
        maxFirstStopDepthM: undefined,
    };
}

/** Critères complets, ou `null` tant qu'aucun gaz de fond n'est choisi. */
export function criteriaFromDraft(draft: OptimizerDraft, gases: Gas[]): OptimizerCriteria | null {
    const bottomGas = gases.find(g => g.id === draft.bottomId);
    if (!bottomGas) return null;
    const decoGases = gases.filter(g => draft.decoIds.includes(g.id));
    return {
        depthM: draft.depthM,
        bottomGas,
        decoGases,
        bottomBlock: draft.bottomBlock,
        decoBlocks: Object.fromEntries(
            decoGases.map(g => [g.name, draft.decoBlocks[g.id] ?? DEFAULT_DECO_BLOCK]),
        ),
        reserves: draft.reserves,
        ...(draft.maxDecoTimeMin !== undefined ? { maxDecoTimeMin: draft.maxDecoTimeMin } : {}),
        ...(draft.maxFirstStopDepthM !== undefined ? { maxFirstStopDepthM: draft.maxFirstStopDepthM } : {}),
    };
}
