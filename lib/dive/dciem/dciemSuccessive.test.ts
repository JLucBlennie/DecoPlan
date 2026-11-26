/** Lancer : npx tsx --test lib/dive/dciem/dciemSuccessive.test.ts */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeDciemSuccessive } from './dciemSuccessive';

function run(surfaceIntervalMin: number) {
  return computeDciemSuccessive({
    first: { depthM: 30, diveTimeMin: 25, descentRateMMin: 20 },
    second: { depthM: 25, diveTimeMin: 25, descentRateMMin: 20 },
    surfaceIntervalMin, ascentRateMMin: 10, ascentRateBetweenStopsMMin: 6,
  });
}

test('la 2e plongée est plus longue à décompresser avec les compartiments chargés', () => {
  const r = run(15);
  assert.ok(r.second.totalAscentTimeMin > r.secondAlone.totalAscentTimeMin);
});

test('plus l\'intervalle est long, moins la 2e plongée est pénalisée', () => {
  const times = [0, 15, 60, 180, 720].map(i => run(i).second.totalAscentTimeMin);
  for (let i = 1; i < times.length; i++) assert.ok(times[i] <= times[i - 1] + 1e-9);
});

test('après un très long intervalle, la 2e plongée revient à une plongée seule', () => {
  const r = run(2000);
  assert.ok(Math.abs(r.second.totalAscentTimeMin - r.secondAlone.totalAscentTimeMin) < 0.5);
});
