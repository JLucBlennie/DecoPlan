/** Lancer : npx tsx --test lib/dive/mn90DiveParameters.test.ts */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getMN90DiveParameters } from './mn90';
import type { DivePlan } from './types';

const seg = (a: number, b: number, s: number, e: number) =>
  ({ startDepthM: a, endDepthM: b, startTimeMin: s, endTimeMin: e });

test('le temps de plongée s\'arrête à la fin du fond, pas au dernier palier', () => {
  const plan = {
    segments: [seg(0, 40, 0, 2), seg(40, 40, 2, 20), seg(40, 6, 20, 23.4),
      seg(6, 6, 23.4, 28), seg(6, 3, 28, 28.5), seg(3, 3, 28.5, 40), seg(3, 0, 40, 40.5)],
  } as unknown as DivePlan;
  assert.deepEqual(getMN90DiveParameters(plan), { maxDepthM: 40, diveTimeMin: 20 });
});
