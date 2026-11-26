/**
 * DecoPlan – Plongées successives : points des profils pour le tracé
 *
 * Temps en minutes depuis la mise à l'eau de la plongée concernée, profondeurs en mètres.
 */

import type { MN90Profile, Segment } from '../types';

export interface ProfilePoint {
  timeMin: number;
  depthM: number;
}

/** Profil Bühlmann : bout à bout des segments (fond + remontée + paliers). */
export function buhlmannPoints(segments: Segment[]): ProfilePoint[] {
  if (segments.length === 0) return [];
  const points: ProfilePoint[] = [{ timeMin: 0, depthM: segments[0].startDepth }];
  let elapsed = 0;
  for (const s of segments) {
    elapsed += s.time;
    points.push({ timeMin: elapsed, depthM: s.endDepth });
  }
  return points;
}

/**
 * Profil MN90 : descente, plateau jusqu'au « temps de plongée » de la table (descente
 * comprise), puis remontée vers le 1er palier, paliers, et surface.
 */
export function mn90Points(
  profile: MN90Profile,
  descentRateMMin: number,
  ascentRateMMin: number,
  ascentRateBetweenStopsMMin: number,
): ProfilePoint[] {
  const descentEnd = profile.maxDepthM / descentRateMMin;
  const bottomEnd = Math.max(profile.bottomTimeMin, descentEnd);

  const points: ProfilePoint[] = [
    { timeMin: 0, depthM: 0 },
    { timeMin: descentEnd, depthM: profile.maxDepthM },
    { timeMin: bottomEnd, depthM: profile.maxDepthM },
  ];

  let t = bottomEnd;
  let depth = profile.maxDepthM;
  let rate = ascentRateMMin;
  for (const stop of profile.stops) {
    t += (depth - stop.depthM) / rate;
    points.push({ timeMin: t, depthM: stop.depthM });
    t += stop.durationMin;
    points.push({ timeMin: t, depthM: stop.depthM });
    depth = stop.depthM;
    rate = ascentRateBetweenStopsMMin;
  }
  t += depth / rate;
  points.push({ timeMin: t, depthM: 0 });
  return points;
}

export function endTimeMin(points: ProfilePoint[]): number {
  return points.length === 0 ? 0 : points[points.length - 1].timeMin;
}

export function maxDepthM(points: ProfilePoint[]): number {
  return points.reduce((m, p) => Math.max(m, p.depthM), 0);
}

/** Étiquette « profondeur·durée » au milieu d'un palier d'un profil MN90/DCIEM. */
export interface StopLabel {
  timeMin: number;
  depthM: number;
  text: string;
}

/** Les paliers d'un profil : niveaux plats sous la profondeur max (le fond est exclu). */
export function stopLabelsOf(points: ProfilePoint[]): StopLabel[] {
  const max = maxDepthM(points);
  const labels: StopLabel[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a.depthM === b.depthM && a.depthM > 0 && a.depthM < max && b.timeMin > a.timeMin) {
      labels.push({ timeMin: (a.timeMin + b.timeMin) / 2, depthM: a.depthM, text: `${a.depthM}m·${Math.round(b.timeMin - a.timeMin)}'` });
    }
  }
  return labels;
}
