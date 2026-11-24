// hooks/useRuntimeSelection.ts
// Runtime mis en évidence dans le graphique, choisi en touchant une colonne ou la légende.
// Le nominal est sélectionné par défaut ; si le runtime choisi disparaît d'un nouveau calcul, retour au nominal.
import { useState } from 'react';

import type { WhatIfKind, WhatIfResult } from '../lib/dive';

export interface RuntimeSelection {
    selectedKind: WhatIfKind;
    select: (kind: WhatIfKind) => void;
}

export function useRuntimeSelection(result: WhatIfResult | null): RuntimeSelection {
    const [chosen, setChosen] = useState<WhatIfKind>('NOMINAL');
    const available = result?.scenarios.some(s => s.kind === chosen) ?? false;
    return {
        selectedKind: chosen === 'NOMINAL' || available ? chosen : 'NOMINAL',
        select: setChosen,
    };
}
