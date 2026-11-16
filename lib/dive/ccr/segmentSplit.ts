/**
 * DecoPlan – CCR : découpe d'un segment en sous-segments linéaires.
 *
 * Le temps est réparti proportionnellement à la distance verticale
 * (vitesse constante sur le segment d'origine).
 */

export interface SegmentPiece {
  startDepth: number;
  endDepth: number;
  time: number;
}

const EPS = 1e-6;

/** Découpe un segment aux profondeurs données (seulement celles strictement à l'intérieur). */
export function splitSegmentAtDepths(
  startDepth: number,
  endDepth: number,
  time: number,
  cutDepths: number[],
): SegmentPiece[] {
  if (Math.abs(endDepth - startDepth) < EPS) {
    return [{ startDepth, endDepth, time }];
  }
  const lo = Math.min(startDepth, endDepth);
  const hi = Math.max(startDepth, endDepth);
  const inner = cutDepths
    .filter(d => d > lo + EPS && d < hi - EPS)
    .sort((a, b) => (endDepth > startDepth ? a - b : b - a));

  const points = [startDepth, ...inner, endDepth];
  const total = Math.abs(endDepth - startDepth);
  const pieces: SegmentPiece[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    pieces.push({ startDepth: a, endDepth: b, time: time * (Math.abs(b - a) / total) });
  }
  return pieces;
}
