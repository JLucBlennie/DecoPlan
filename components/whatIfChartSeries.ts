// components/whatIfChartSeries.ts
// Séries du graphique « Et si ? » : un profil (temps, profondeur) par runtime, avec sa couleur.
import { buhlmannPoints, type ProfilePoint, type WhatIfKind, type WhatIfResult } from '../lib/dive';

export interface WhatIfSeries {
    kind: WhatIfKind;
    label: string;
    color: string;
    isReference: boolean;
    points: ProfilePoint[];
}

/** Une couleur distincte par scénario ; le nominal reste blanc, plus épais. */
export const SERIES_COLORS: Record<WhatIfKind, string> = {
    NOMINAL: '#E8EEF5',
    DEEPER: '#E24B4A',
    LONGER: '#EF9F27',
    SHORT_BOTTOM: '#1D9E75',
    LOST_DECO_GAS: '#C06BE0',
    BAILOUT: '#378ADD',
};

export function buildWhatIfSeries(result: WhatIfResult): WhatIfSeries[] {
    // Les scénarios sont dessinés d'abord, le nominal en dernier pour rester visible par-dessus.
    return [...result.scenarios, result.nominal]
        .map(r => ({
            kind: r.kind,
            label: r.label,
            color: SERIES_COLORS[r.kind],
            isReference: r.kind === 'NOMINAL',
            points: buhlmannPoints(r.segments),
        }))
        .filter(s => s.points.length > 0);
}
