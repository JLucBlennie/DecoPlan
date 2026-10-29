// components/runtimeKindMeta.ts
// Libellé et couleurs de chaque phase d'un runtime (tableau détaillé et colonnes « Et si »).
import type { SegmentKind } from '../lib/dive';
import { ocean } from '../styles/theme';

export const KIND_META: Record<SegmentKind, { label: string; color: string; bg: string }> = {
    descent: { label: 'Descente', color: ocean.accent.blue, bg: 'rgba(55,138,221,0.1)' },
    bottom: { label: 'Fond', color: ocean.accent.teal, bg: 'rgba(29,158,117,0.08)' },
    ascent: { label: 'Remontée', color: ocean.text.muted, bg: 'transparent' },
    deco: { label: 'Palier', color: '#BA7517', bg: 'rgba(186,117,23,0.1)' },
};

/** Couleur des écarts : plus long = moins favorable (ambre), plus court = favorable (teal). */
export const TREND_COLOR = {
    worse: '#BA7517',
    better: ocean.accent.teal,
    same: ocean.text.muted,
} as const;
