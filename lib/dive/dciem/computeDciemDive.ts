import { SEA_LEVEL_MSW, STOP_INTERVAL_M } from './constants';
import { type CompartmentPressures, stepCompartments, surfaceCompartments } from './compartments';
import { safeAscentDepth } from './safeAscentDepth';
import type { DciemParameters, DciemResult, DciemStop } from './types';

/** Pas d'intégration (min). */
const DT_MIN = 0.05;
/** Garde-fou : attente maximale à un palier (min). */
const MAX_STOP_WAIT_MIN = 1000;
/** Attentes inférieures à ce seuil (min) : bruit numérique, pas un palier. */
const WAIT_EPSILON_MIN = 1e-3;

/** Fait évoluer les compartiments pendant une phase de profondeur linéaire. */
function integratePhase(
  p: CompartmentPressures,
  fromDepthM: number,
  toDepthM: number,
  durationMin: number,
): CompartmentPressures {
  if (durationMin <= 0) return p;
  const steps = Math.max(1, Math.ceil(durationMin / DT_MIN));
  const h = durationMin / steps;
  let state = p;
  for (let i = 0; i < steps; i++) {
    const a = SEA_LEVEL_MSW + fromDepthM + ((toDepthM - fromDepthM) * i) / steps;
    const b = SEA_LEVEL_MSW + fromDepthM + ((toDepthM - fromDepthM) * (i + 1)) / steps;
    state = stepCompartments(state, a, b, h);
  }
  return state;
}

/** Palier de 3 m juste au-dessus de `depthM` (0 = surface). */
function nextStopDepth(depthM: number): number {
  return Math.max(0, (Math.ceil(depthM / STOP_INTERVAL_M) - 1) * STOP_INTERVAL_M);
}

/**
 * Plongée à profil carré selon le modèle DCIEM 1983 : descente, fond jusqu'à
 * `diveTimeMin` (descente comprise, comme MN90), puis remontée par paliers de
 * 3 m. À chaque palier on attend que la SAD autorise le palier suivant.
 */
export function computeDciemDive(params: DciemParameters): DciemResult {
  const { depthM, diveTimeMin, descentRateMMin, ascentRateMMin, ascentRateBetweenStopsMMin } = params;

  let p = surfaceCompartments();
  const descentMin = depthM / descentRateMMin;
  p = integratePhase(p, 0, depthM, Math.min(descentMin, diveTimeMin));
  p = integratePhase(p, depthM, depthM, diveTimeMin - descentMin);

  const stops: DciemStop[] = [];
  let ascentTravelMin = 0;
  let current = depthM;
  let rate = ascentRateMMin;

  while (current > 0) {
    const next = nextStopDepth(current);
    const travel = (current - next) / rate;
    p = integratePhase(p, current, next, travel);
    ascentTravelMin += travel;
    current = next;
    rate = ascentRateBetweenStopsMMin;
    if (current === 0) break;

    let wait = 0;
    while (safeAscentDepth(p) > current - STOP_INTERVAL_M + 1e-9 && wait < MAX_STOP_WAIT_MIN) {
      p = integratePhase(p, current, current, DT_MIN);
      wait += DT_MIN;
    }
    if (wait > WAIT_EPSILON_MIN) {
      stops.push({ depthM: current, durationMin: Math.ceil(wait - WAIT_EPSILON_MIN) });
    }
  }

  const stopsTotal = stops.reduce((sum, s) => sum + s.durationMin, 0);
  return {
    depthM,
    diveTimeMin,
    stops,
    totalAscentTimeMin: ascentTravelMin + stopsTotal,
    noStop: stops.length === 0,
  };
}
