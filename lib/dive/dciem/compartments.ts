import { COMPARTMENT_COUNT, FLOW_A, FLOW_B, SEA_LEVEL_MSW } from './constants';

/** Pressions absolues (msw) des 4 compartiments en série. */
export type CompartmentPressures = readonly [number, number, number, number];

/** État d'un plongeur saturé à la surface, à l'air. */
export function surfaceCompartments(): CompartmentPressures {
  return [SEA_LEVEL_MSW, SEA_LEVEL_MSW, SEA_LEVEL_MSW, SEA_LEVEL_MSW];
}

/**
 * Dérivées dPi/dt (équations 1 à 4 du rapport 84-R-44) :
 *   dPi/dt = A·[(B + Pi-1 + Pi)(Pi-1 − Pi) − (B + Pi + Pi+1)(Pi − Pi+1)]
 * avec P0 = pression ambiante ; le compartiment 4 n'a pas de terme de sortie.
 */
function derivatives(p: readonly number[], ambient: number): number[] {
  const chain = [ambient, ...p];
  const result: number[] = [];
  for (let i = 1; i <= COMPARTMENT_COUNT; i++) {
    const inflow = (FLOW_B + chain[i - 1] + chain[i]) * (chain[i - 1] - chain[i]);
    const outflow = i === COMPARTMENT_COUNT
      ? 0
      : (FLOW_B + chain[i] + chain[i + 1]) * (chain[i] - chain[i + 1]);
    result.push(FLOW_A * (inflow - outflow));
  }
  return result;
}

function advance(p: readonly number[], d: number[], h: number): number[] {
  return p.map((v, i) => v + h * d[i]);
}

/**
 * Un pas de Runge-Kutta 4 de durée `dtMin`, la pression ambiante variant
 * linéairement de `ambientStartMsw` à `ambientEndMsw` pendant le pas.
 */
export function stepCompartments(
  p: CompartmentPressures,
  ambientStartMsw: number,
  ambientEndMsw: number,
  dtMin: number,
): CompartmentPressures {
  const mid = (ambientStartMsw + ambientEndMsw) / 2;
  const k1 = derivatives(p, ambientStartMsw);
  const k2 = derivatives(advance(p, k1, dtMin / 2), mid);
  const k3 = derivatives(advance(p, k2, dtMin / 2), mid);
  const k4 = derivatives(advance(p, k3, dtMin), ambientEndMsw);
  const next = p.map((v, i) => v + (dtMin / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  return next as unknown as CompartmentPressures;
}
