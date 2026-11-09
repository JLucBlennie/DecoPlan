/**
 * DecoPlan – Écran « Successive » : formats d'affichage
 */

import type { MN90DiveRelation, RuntimeStop } from '../../lib/dive';
import type { MN90Stop } from '../../lib/dive/types';

/** 45 → « 45 min », 90 → « 1 h 30 », 120 → « 2 h ». */
export function formatInterval(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

export const RELATION_LABELS: Record<MN90DiveRelation, string> = {
  CONSECUTIVE: 'Consécutives (< 15 min) : une seule plongée',
  SUCCESSIVE: 'Successives (15 min à 12 h) : azote résiduel',
  INDEPENDENT: 'Indépendantes (≥ 12 h)',
};

export function formatBuhlmannStops(stops: RuntimeStop[]): string {
  if (stops.length === 0) return 'sans palier';
  return stops.map(s => `${s.depthM} m ${Math.round(s.durationMin)}′`).join(' · ');
}

export function formatMn90Stops(stops: MN90Stop[]): string {
  if (stops.length === 0) return 'sans palier';
  return stops.map(s => `${s.depthM} m ${Math.round(s.durationMin)}′`).join(' · ');
}
