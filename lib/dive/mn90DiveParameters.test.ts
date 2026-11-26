/** Lancer : npx tsx --test lib/dive/mn90DiveParameters.test.ts */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getMN90DiveParameters } from './mn90';
import { mn90ParametersFromSegments } from './successive/mn90Params';
import type { DivePlan } from './types';

const seg = (a: number, b: number, s: number, e: number) =>
  ({ startDepthM: a, endDepthM: b, startTimeMin: s, endTimeMin: e });

const computed = [seg(0, 40, 0, 2), seg(40, 40, 2, 20), seg(40, 6, 20, 23.4),
  seg(6, 6, 23.4, 28), seg(6, 3, 28, 28.5), seg(3, 3, 28.5, 40), seg(3, 0, 40, 40.5)];

test('le profil saisi prime sur le plan calculé', () => {
  const plan = { segments: computed, enteredDive: { maxDepthM: 40, diveTimeMin: 20 } } as unknown as DivePlan;
  assert.deepEqual(getMN90DiveParameters(plan), { maxDepthM: 40, diveTimeMin: 20 });
});

test('repli sans profil saisi : on s\'arrête à la première remontée depuis le fond', () => {
  const plan = { segments: computed } as unknown as DivePlan;
  assert.deepEqual(getMN90DiveParameters(plan), { maxDepthM: 40, diveTimeMin: 20 });
});

test('segments saisis : profondeur max et durée totale des niveaux', () => {
  const entered = [
    { startDepth: 0, endDepth: 40, gasName: 'Air', time: 2 },
    { startDepth: 40, endDepth: 40, gasName: 'Air', time: 18 },
    { startDepth: 40, endDepth: 25, gasName: 'Air', time: 10 },
  ];
  assert.deepEqual(mn90ParametersFromSegments(entered), { maxDepthM: 40, diveTimeMin: 30 });
});
