// components/charts/profileFrame.ts
// Cadre commun des graphiques de profil (temps × profondeur) : marges, échelle, graduations.

export const PL = 38;
export const PR = 8;
export const PT = 10;
export const PB = 26;
export const MIN_WIDTH = 120;

export interface ProfileScale {
    /** Largeur et hauteur utiles (marges déduites). */
    pw: number;
    ph: number;
    /** Minutes → abscisse. */
    tx: (timeMin: number) => number;
    /** Mètres → ordonnée (0 m en haut). */
    ty: (depthM: number) => number;
    /** Profondeur de l'axe, arrondie au 10 m supérieur. */
    axisMaxM: number;
}

/** Axe de profondeur : au moins 10 m, arrondi au 10 m supérieur. */
export function depthAxisMax(maxDepthM: number): number {
    return Math.ceil(Math.max(10, maxDepthM) / 10) * 10;
}

export function profileScale(width: number, height: number, maxTimeMin: number, maxDepthM: number): ProfileScale {
    const pw = width - PL - PR;
    const ph = height - PT - PB;
    const axisMaxM = depthAxisMax(maxDepthM);
    const lenMin = Math.max(1, maxTimeMin);
    return {
        pw, ph, axisMaxM,
        tx: t => PL + (t / lenMin) * pw,
        ty: d => PT + (d / axisMaxM) * ph,
    };
}

/** Graduations de profondeur : tous les 10 m, de 0 à l'axe. */
export function depthTicks(axisMaxM: number): number[] {
    return Array.from({ length: axisMaxM / 10 + 1 }, (_, i) => i * 10);
}

/** Graduations du temps : 5 / 10 / 15 / 30 min selon la durée. */
export function timeTicks(lenMin: number): number[] {
    const step = lenMin <= 20 ? 5 : lenMin <= 60 ? 10 : lenMin <= 120 ? 15 : 30;
    const ticks: number[] = [];
    for (let t = step; t < lenMin; t += step) ticks.push(t);
    return ticks;
}
