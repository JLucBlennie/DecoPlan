// components/charts/flatLevels.ts
// Niveaux à profondeur constante d'un profil (fond et paliers), pour les zones et leurs étiquettes.
import type { ProfilePoint } from '../../lib/dive';

export interface FlatLevel {
    startMin: number;
    endMin: number;
    depthM: number;
}

/** Points consécutifs à la même profondeur (> 0 m) fusionnés en un niveau. */
export function flatLevels(points: ProfilePoint[]): FlatLevel[] {
    const levels: FlatLevel[] = [];
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        if (a.depthM !== b.depthM || a.depthM <= 0 || b.timeMin <= a.timeMin) continue;
        const last = levels[levels.length - 1];
        if (last && last.depthM === a.depthM && last.endMin === a.timeMin) last.endMin = b.timeMin;
        else levels.push({ startMin: a.timeMin, endMin: b.timeMin, depthM: a.depthM });
    }
    return levels;
}
