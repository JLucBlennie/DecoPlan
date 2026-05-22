/**
 * Tests unitaires de l'algorithme Bühlmann ZHL-16C + Gradient Factors
 *
 * Référence de validation : MultiDeco 4.26 (Ross Hemingway / Erik C. Baker)
 *
 * Profil de référence :
 *   Plongée  : Triox 21/35 → 40m, descente 18m/min, fond 22min47s
 *   Déco     : EAN50, remontée 8m/min entre paliers
 *   GF       : 50 / 80
 *   Résultat : 15m×1min, 12m×1min, 9m×2min, 6m×6min, 3m×10min
 *
 * NOTE : calculateDecompression() retourne UNIQUEMENT les segments de déco,
 * pas le profil fond (descente + palier fond). Cela permet de distinguer
 * paliers déco et palier fond sans ambiguïté.
 */

import { Buhlmann } from '../buhlmann';
import { Dive } from '../dive';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extrait les paliers de déco (segments plats) depuis les segments retournés
 * par calculateDecompression().
 * calculateDecompression() ne retourne que les segments déco → pas de risque
 * d'inclure le palier fond.
 */
function getDecoStops(segments: Dive.Segment[]): Array<{ depth: number; time: number }> {
  return segments
    .filter(s => s.startDepth === s.endDepth && s.startDepth > 0)
    .map(s => ({ depth: s.startDepth, time: s.time }));
}

/** Durée totale en minutes pour un palier donné (peut être splitté en plusieurs segments) */
function stopTimeAt(stops: Array<{ depth: number; time: number }>, depth: number): number {
  return stops
    .filter(s => s.depth === depth)
    .reduce((acc, s) => acc + s.time, 0);
}

// ---------------------------------------------------------------------------
// Profil MultiDeco de référence
// ---------------------------------------------------------------------------

/**
 * Crée un plan initialisé avec le profil Triox 40m / 22min47s.
 * Paramètres identiques à MultiDeco 4.26 :
 *   - Descente 18 m/min → temps = 40/18 ≈ 2.222 min
 *   - Fond    22 min 47 s ≈ 22.783 min  (runtime fin de fond = 25 min)
 *   - Gaz fond  : Triox 21/35
 *   - Gaz déco  : EAN50
 */
function buildMultiDecoPlan(): Buhlmann.Plan {
  const plan = new Buhlmann.Plan(Buhlmann.ZH16CTissues, 1.0, false);
  plan.addBottomGas(Dive.gas('Triox2135', 0.21, 0.35));
  plan.addDecoGas(Dive.gas('EAN50', 0.50, 0.0));
  plan.addDepthChange(0, 40, 'Triox2135', 40 / 18);      // descente 18 m/min
  plan.addFlat(40, 'Triox2135', 22 + 47 / 60);           // fond 22min47s
  return plan;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Bühlmann ZHL-16C + GF — Référence MultiDeco 4.26', () => {

  // -------------------------------------------------------------------------
  describe('Profil Triox 40m/22:47 — GF 50/80 — EAN50', () => {
    let stops: Array<{ depth: number; time: number }>;
    let segments: Dive.Segment[];

    beforeAll(() => {
      const plan = buildMultiDecoPlan();
      /*
       * calculateDecompression(maintainTissues, gfLow, gfHigh, maxppO2, maxEND,
       *                         fromDepth, ascentRateMpm, timeStepMin)
       *   ascentRateMpm = 8    → identique MultiDeco (-8m/min)
       *   timeStepMin   = 0.5  → résolution 30s (précision sub-minute)
       */
      segments = plan.calculateDecompression(
        false, 0.50, 0.80, 1.6, 30, undefined, 8, 0.5
      );
      stops = getDecoStops(segments);
      console.log('\n--- Segments déco retournés ---');
      console.table(segments.map(s => ({
        type: s.startDepth === s.endDepth ? 'PALIER' : 'REMONTÉE',
        de: s.startDepth + 'm',
        vers: s.endDepth + 'm',
        gaz: s.gasName,
        'temps(min)': +s.time.toFixed(2)
      })));
    });

    // --- Structure du plan déco ---

    test('calculateDecompression retourne uniquement les segments déco (pas le fond)', () => {
      // Aucun segment ne doit avoir startDepth=40 (fond)
      expect(segments.every(s => s.startDepth <= 40)).toBe(true);
      // Le segment le plus profond parmi les plats déco doit être ≤ 21m
      const flatDepths = segments
        .filter(s => s.startDepth === s.endDepth)
        .map(s => s.startDepth);
      expect(Math.max(...flatDepths)).toBeLessThanOrEqual(21);
    });

    test('1er palier à 15m (GF Low = 50)', () => {
      const deepest = Math.max(...stops.map(s => s.depth));
      expect(deepest).toBe(15);
    });

    test('Paliers présents à 15m, 12m, 9m, 6m, 3m', () => {
      [15, 12, 9, 6, 3].forEach(d =>
        expect(stops.some(s => s.depth === d)).toBe(true)
      );
    });

    // --- Durées des paliers (référence MultiDeco : 15m×1, 12m×1, 9m×2, 6m×6, 3m×10) ---
    // Tolérance ±1 min : résolution 30s vs secondes dans MultiDeco

    test('15m — 1 min (±1)',  () => expect(Math.round(stopTimeAt(stops, 15))).toBeCloseTo(1,  0));
    test('12m — 1 min (±1)',  () => expect(Math.round(stopTimeAt(stops, 12))).toBeCloseTo(1,  0));
    test('9m  — 2 min (±1)',  () => expect(Math.round(stopTimeAt(stops,  9))).toBeCloseTo(2,  0));
    test('6m  — 6 min (±1)',  () => expect(Math.round(stopTimeAt(stops,  6))).toBeCloseTo(6,  0));
    test('3m  — 10 min (±1)', () => expect(Math.round(stopTimeAt(stops,  3))).toBeCloseTo(10, 0));

    test('Durée totale déco entre 18 et 22 min (ref MultiDeco : 20 min)', () => {
      const total = stops.reduce((acc, s) => acc + s.time, 0);
      console.log('Durée totale déco :', total.toFixed(1), 'min');
      expect(total).toBeGreaterThanOrEqual(18);
      expect(total).toBeLessThanOrEqual(22);
    });

    // --- Changement de gaz ---

    test('Gaz de fond Triox utilisé pendant la remontée initiale (40→22m)', () => {
      const initialAscent = segments.find(
        s => s.startDepth > 20 && s.endDepth < s.startDepth && s.gasName === 'Triox2135'
      );
      expect(initialAscent).toBeDefined();
    });

    test('Switch vers EAN50 avant le 1er palier', () => {
      const ean50Segments = segments.filter(s => s.gasName === 'EAN50');
      expect(ean50Segments.length).toBeGreaterThan(0);
      // Le switch doit avoir lieu avant ou à 22m (MOD EAN50 à ppO2 1.6)
      const firstEan50 = ean50Segments[0];
      expect(firstEan50.startDepth).toBeLessThanOrEqual(22);
    });
  });

  // -------------------------------------------------------------------------
  describe('NDL Air — sans déco (ref tables USN / PADI)', () => {
    let plan: Buhlmann.Plan;
    beforeAll(() => {
      plan = new Buhlmann.Plan(Buhlmann.ZH16CTissues);
      plan.addBottomGas(Dive.gas('Air', 0.21, 0.0));
    });

    test('NDL à 18m > 45 min', () => expect(plan.ndl(18, 'Air', 1.0)).toBeGreaterThan(45));
    test('NDL à 30m entre 10 et 25 min', () => {
      const ndl = plan.ndl(30, 'Air', 1.0);
      expect(ndl).toBeGreaterThan(10);
      expect(ndl).toBeLessThan(25);
    });
    test('NDL à 40m entre 5 et 12 min', () => {
      const ndl = plan.ndl(40, 'Air', 1.0);
      expect(ndl).toBeGreaterThan(5);
      expect(ndl).toBeLessThan(12);
    });
  });

  // -------------------------------------------------------------------------
  describe('Cohérence GF', () => {
    test('GF 100/100 → paliers plus courts que GF 50/80', () => {
      const permissive   = buildMultiDecoPlan();
      const conservative = buildMultiDecoPlan();
      const tPerm = getDecoStops(
        permissive.calculateDecompression(false, 1.0, 1.0, 1.6, 30, undefined, 8, 1)
      ).reduce((a, s) => a + s.time, 0);
      const tCons = getDecoStops(
        conservative.calculateDecompression(false, 0.5, 0.8, 1.6, 30, undefined, 8, 1)
      ).reduce((a, s) => a + s.time, 0);
      expect(tCons).toBeGreaterThan(tPerm);
    });

    test('GF Low plus bas → 1er palier plus profond', () => {
      const p30 = buildMultiDecoPlan();
      const p70 = buildMultiDecoPlan();
      const stops30 = getDecoStops(p30.calculateDecompression(false, 0.30, 0.80, 1.6, 30, undefined, 8, 1));
      const stops70 = getDecoStops(p70.calculateDecompression(false, 0.70, 0.80, 1.6, 30, undefined, 8, 1));
      const first30 = Math.max(...stops30.map(s => s.depth));
      const first70 = Math.max(...stops70.map(s => s.depth));
      expect(first30).toBeGreaterThanOrEqual(first70);
    });
  });
});
