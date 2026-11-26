/**
 * Validation du moteur DCIEM contre le DCIEM Diving Manual (1992), Table 1
 * « Standard Air Decompression (metres) » : valeurs relevées à la main sur le pdf
 * fourni, UNIQUEMENT pour tester (les tables ne sont pas embarquées dans l'app).
 * Conditions de la table : descente et remontée à 18 m/min.
 *
 * Lancer :  npx tsx --test lib/dive/dciem/computeDciemDive.test.ts
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeDciemDive } from './computeDciemDive';

type Stops = Record<number, number>;

/** Écart toléré par palier (min) : arrondis de la table et durcissement empirique. */
const TOLERANCE_MIN = 2;

const TABLE_1: { depth: number; time: number; stops: Stops }[] = [
  { depth: 30, time: 30, stops: { 6: 5, 3: 10 } },
  { depth: 30, time: 45, stops: { 9: 3, 6: 8, 3: 23 } },
  { depth: 30, time: 110, stops: { 12: 4, 9: 8, 6: 38, 3: 106 } },
  { depth: 24, time: 60, stops: { 6: 6, 3: 21 } },
  { depth: 24, time: 110, stops: { 9: 2, 6: 12, 3: 64 } },
  { depth: 18, time: 90, stops: { 3: 16 } },
  { depth: 15, time: 140, stops: { 3: 21 } },
  { depth: 15, time: 280, stops: { 3: 91 } },
  { depth: 12, time: 300, stops: { 3: 44 } },
  { depth: 27, time: 60, stops: { 9: 2, 6: 8, 3: 31 } },
  { depth: 27, time: 120, stops: { 9: 8, 6: 31, 3: 95 } },
];

for (const row of TABLE_1) {
  test(`Table 1 : ${row.depth} m / ${row.time} min`, () => {
    const result = computeDciemDive({
      depthM: row.depth, diveTimeMin: row.time,
      descentRateMMin: 18, ascentRateMMin: 18, ascentRateBetweenStopsMMin: 18,
    });
    const computed: Stops = Object.fromEntries(result.stops.map(s => [s.depthM, s.durationMin]));
    for (const depth of new Set([...Object.keys(row.stops), ...Object.keys(computed)].map(Number))) {
      const expected = row.stops[depth] ?? 0;
      const actual = computed[depth] ?? 0;
      assert.ok(Math.abs(actual - expected) <= TOLERANCE_MIN,
        `palier ${depth} m : calculé ${actual} min, table ${expected} min`);
    }
  });
}

test('plongée courte sans palier : 18 m / 30 min', () => {
  const result = computeDciemDive({
    depthM: 18, diveTimeMin: 30,
    descentRateMMin: 18, ascentRateMMin: 18, ascentRateBetweenStopsMMin: 18,
  });
  assert.equal(result.noStop, true);
  assert.equal(result.stops.length, 0);
});

test('les paliers sont multiples de 3 m, décroissants et la durée totale les inclut', () => {
  const result = computeDciemDive({
    depthM: 40, diveTimeMin: 40,
    descentRateMMin: 20, ascentRateMMin: 10, ascentRateBetweenStopsMMin: 6,
  });
  assert.ok(result.stops.length > 0);
  result.stops.forEach((s, i) => {
    assert.equal(s.depthM % 3, 0);
    if (i > 0) assert.ok(s.depthM < result.stops[i - 1].depthM);
  });
  const waits = result.stops.reduce((sum, s) => sum + s.durationMin, 0);
  assert.ok(result.totalAscentTimeMin > waits);
});
