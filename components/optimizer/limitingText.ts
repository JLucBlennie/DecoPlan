// components/optimizer/limitingText.ts
// Texte lisible pour ce qui limite le temps de fond.
import { MAX_SEARCH_BOTTOM_TIME_MIN, type LimitingFactor } from '../../lib/dive';

export function limitingText(factor: LimitingFactor): string {
    switch (factor.kind) {
        case 'bottom-gas': return 'le gaz de fond (réserve comprise)';
        case 'deco-gas': return `le gaz de déco ${factor.gasName} (réserve comprise)`;
        case 'deco-time': return 'la durée de déco maximale';
        case 'first-stop': return 'la profondeur maximale du 1er palier';
        case 'search-cap': return `la limite de recherche (${MAX_SEARCH_BOTTOM_TIME_MIN} min)`;
    }
}
