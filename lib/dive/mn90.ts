// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — Table MN90 (Marine Nationale 1990), profil pour le mode pédagogique
// ─────────────────────────────────────────────────────────────────────────────
import type { DivePlan, MN90Profile, MN90Stop } from './types';
import { MN90_DEPTHS, MN90_TABLE, type Mn90Entry } from './mn90Table';

/** Profondeurs de palier gérées par la table, de la plus profonde à la plus proche de la surface. */
const STOP_DEPTHS = [15, 12, 9, 6, 3] as const;

/**
 * Retourne le profil MN90 correspondant au plan de plongée fourni.
 *
 * Convention MN90 : la profondeur atteinte est arrondie au palier de
 * profondeur supérieur de la table, et le "temps de plongée" (immersion
 * jusqu'au début de la remontée, DESCENTE COMPRISE — c'est la définition
 * officielle MN90, pas un simple temps de fond) au palier de temps
 * supérieur pour cette profondeur. La vitesse de remontée passée en
 * paramètre sert à estimer la durée totale affichée jusqu'à la surface.
 * Retourne undefined si la plongée est hors table (profondeur > 65 m,
 * temps au-delà du dernier palier, ou entrée marquée "*" = procédure
 * spéciale requise).
 *
 * @param plan plan de plongée simulé (segments déjà chronométrés avec les
 *             vitesses de descente/remontée réelles de l'utilisateur)
 * @param ascentRateMMin vitesse de remontée fond→1er palier (m/min), depuis les préférences
 * @param ascentRateBetweenStopsMMin vitesse de remontée entre paliers et jusqu'à la surface (m/min), depuis les préférences
 */
export function getMN90Profile(
  plan: DivePlan,
  ascentRateMMin: number,
  ascentRateBetweenStopsMMin: number,
): MN90Profile | undefined {
  const maxDepth = Math.max(...plan.segments.map(s => Math.max(s.startDepthM, s.endDepthM)));

  // Temps de plongée MN90 = temps écoulé depuis la surface (t=0) jusqu'à la
  // fin du dernier segment de fond — descente comprise, conformément à la
  // définition MN90. Les segments étant chronométrés avec la vraie vitesse
  // de descente (usePreferencesStore.descentRateMMin), pas besoin de la
  // repasser ici : elle est déjà intégrée dans endTimeMin.
  const bottomSegments = plan.segments
    .filter(s => s.startDepthM === s.endDepthM && s.startDepthM >= maxDepth * 0.9);
  const diveTimeMin = bottomSegments.length > 0
    ? bottomSegments[bottomSegments.length - 1].endTimeMin
    : 0;

  const entry = lookupMn90Entry(maxDepth, diveTimeMin);
  if (!entry || entry.gps === '*') return undefined;

  const stops: MN90Stop[] = STOP_DEPTHS
    .map(depthM => ({ depthM, durationMin: entry.stops[String(depthM) as keyof Mn90Entry['stops']] }))
    .filter(s => s.durationMin > 0);

  // Temps de trajet : fond→1er palier à ascentRateMMin, puis chaque
  // transition suivante (palier→palier, dernier palier→surface) à
  // ascentRateBetweenStopsMMin, plus lente — cohérent avec le tracé du profil.
  let travelTimeMin = 0;
  let currentDepth = entry.depth;
  let isFirstLeg = true;
  for (const stop of stops) {
    const rate = isFirstLeg ? ascentRateMMin : ascentRateBetweenStopsMMin;
    travelTimeMin += (currentDepth - stop.depthM) / rate;
    currentDepth = stop.depthM;
    isFirstLeg = false;
  }
  travelTimeMin += currentDepth / (isFirstLeg ? ascentRateMMin : ascentRateBetweenStopsMMin);

  const totalStopsMin = stops.reduce((t, s) => t + s.durationMin, 0);
  const totalAscentTimeMin = Math.round(travelTimeMin + totalStopsMin);

  return {
    maxDepthM: entry.depth,
    bottomTimeMin: entry.time,
    stops,
    totalAscentTimeMin,
  };
}

/**
 * Recherche l'entrée MN90 : profondeur arrondie au palier supérieur
 * disponible, puis temps arrondi au palier de temps supérieur pour cette
 * profondeur. Retourne undefined si hors table.
 */
function lookupMn90Entry(depthM: number, timeMin: number): Mn90Entry | undefined {
  const roundedDepth = MN90_DEPTHS.find(d => d >= depthM);
  if (roundedDepth === undefined) return undefined; // > 65 m

  return MN90_TABLE
    .filter(e => e.depth === roundedDepth)
    .find(e => e.time >= timeMin); // undefined si temps au-delà de la table
}
