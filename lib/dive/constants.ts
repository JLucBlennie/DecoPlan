// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — Constantes ZHL-16C
// ─────────────────────────────────────────────────────────────────────────────

export interface CompartmentCoeff {
    halfTime: number; // min
    a: number;        // bar
    b: number;        // sans unité
}

/** Coefficients N2 ZHL-16C — 16 compartiments */
/* export const ZHL16C_N2: CompartmentCoeff[] = [
    { halfTime: 5.0, a: 1.1696, b: 0.5578 },
    { halfTime: 8.0, a: 1.0000, b: 0.6514 },
    { halfTime: 12.5, a: 0.8618, b: 0.7222 },
    { halfTime: 18.5, a: 0.7562, b: 0.7825 },
    { halfTime: 27.0, a: 0.6491, b: 0.8126 },
    { halfTime: 38.3, a: 0.5316, b: 0.8434 },
    { halfTime: 54.3, a: 0.4410, b: 0.8693 },
    { halfTime: 77.0, a: 0.4000, b: 0.8910 },
    { halfTime: 109.0, a: 0.3750, b: 0.9092 },
    { halfTime: 146.0, a: 0.3500, b: 0.9222 },
    { halfTime: 187.0, a: 0.3295, b: 0.9319 },
    { halfTime: 239.0, a: 0.3065, b: 0.9403 },
    { halfTime: 305.0, a: 0.2835, b: 0.9477 },
    { halfTime: 390.0, a: 0.2610, b: 0.9544 },
    { halfTime: 498.0, a: 0.2480, b: 0.9602 },
    { halfTime: 635.0, a: 0.2327, b: 0.9653 },
]; */
// ── NOTE_CONSTANTS ─────────────────────────────────────────────────────────────
/*
 * L'implémentation buhlmann.ts utilise 17 compartiments (le premier à
 * n2HalfTime = 4.0 min). Le hook usePedagogicalSimulation utilise actuellement
 * les 16 compartiments standard de ZHL-16C (commençant à 5.0 min).
 *
 * Pour aligner parfaitement l'animation sur le calcul réel, remplacer dans
 * constants.ts le tableau ZHL16C_N2 par la version 17 compartiments issue de
 * buhlmann.ts, et mettre à jour NC = 17.
 *
 * Extrait correspondant :
 */
  export const NC = 17;
 
  export const ZHL16C_N2: CompartmentCoeff[] = [
    { halfTime: 4.0,   a: 1.2599, b: 0.505  },  // compartiment 0 (extra)
    { halfTime: 5.0,   a: 1.2599, b: 0.505  },
    { halfTime: 8.0,   a: 1.0,    b: 0.6514 },
    { halfTime: 12.5,  a: 0.8618, b: 0.7222 },
    { halfTime: 18.5,  a: 0.7562, b: 0.7725 },  // ← b=0.7725 (≠ 0.7825 standard)
    { halfTime: 27.0,  a: 0.62,   b: 0.8125 },
    { halfTime: 38.3,  a: 0.5043, b: 0.8434 },
    { halfTime: 54.3,  a: 0.441,  b: 0.8693 },
    { halfTime: 77.0,  a: 0.4,    b: 0.891  },
    { halfTime: 109.0, a: 0.375,  b: 0.9092 },
    { halfTime: 146.0, a: 0.35,   b: 0.9222 },
    { halfTime: 187.0, a: 0.3295, b: 0.9319 },
    { halfTime: 239.0, a: 0.3065, b: 0.9403 },
    { halfTime: 305.0, a: 0.2835, b: 0.9477 },
    { halfTime: 390.0, a: 0.261,  b: 0.9544 },
    { halfTime: 498.0, a: 0.248,  b: 0.9602 },
    { halfTime: 635.0, a: 0.2327, b: 0.9653 },
  ];
 
 /* Différences notables vs ZHL-16C standard :
 *   - Compartiment 0 supplémentaire (t½=4.0)
 *   - C5 : b=0.7725 au lieu de 0.7825
 *   - C6 : a=0.62  au lieu de 0.6491
 * Ces valeurs viennent de la version historique utilisée dans buhlmann.ts.
 */

/** Coefficients He ZHL-16C — 16 compartiments */
export const ZHL16C_HE: CompartmentCoeff[] = [
    { halfTime: 1.51, a: 1.7424, b: 0.4245 },
    { halfTime: 1.88, a: 1.6189, b: 0.4770 },
    { halfTime: 3.02, a: 1.3830, b: 0.5747 },
    { halfTime: 4.72, a: 1.1919, b: 0.6527 },
    { halfTime: 6.99, a: 1.0458, b: 0.7223 },
    { halfTime: 10.21, a: 0.9220, b: 0.7582 },
    { halfTime: 14.48, a: 0.8205, b: 0.7957 },
    { halfTime: 20.53, a: 0.7305, b: 0.8279 },
    { halfTime: 29.11, a: 0.6502, b: 0.8553 },
    { halfTime: 41.20, a: 0.5950, b: 0.8757 },
    { halfTime: 55.19, a: 0.5545, b: 0.8903 },
    { halfTime: 70.69, a: 0.5333, b: 0.8997 },
    { halfTime: 90.34, a: 0.5189, b: 0.9073 },
    { halfTime: 115.29, a: 0.5181, b: 0.9122 },
    { halfTime: 147.42, a: 0.5176, b: 0.9171 },
    { halfTime: 188.24, a: 0.5172, b: 0.9217 },
    { halfTime: 240.03, a: 0.5119, b: 0.9267 },
];

// export const NC = 16; // nombre de compartiments

export const WATER_VAPOR_PRESSURE_BAR = 0.0627;
export const SURFACE_PRESSURE_BAR = 1.0;
export const DEFAULT_RMV_L_MIN = 20;    // RMV surface (L/min)
export const DEFAULT_DT_MIN = 0.1;      // pas de simulation (min)
export const ASCENT_RATE_M_MIN = 9;     // vitesse de remontée FFESSM (m/min)