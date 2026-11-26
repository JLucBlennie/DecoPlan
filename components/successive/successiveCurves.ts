/**
 * Courbes du graphique des deux plongées, partagées avec les panneaux de comparaison :
 * toucher la légende ou un panneau met la courbe (et le panneau) en évidence.
 */

export type CurveId = 'BUHLMANN' | 'MN90' | 'DCIEM';

export const CURVE_COLORS: Record<CurveId, string> = {
  BUHLMANN: '#378ADD',
  MN90: '#EF9F27',
  DCIEM: '#A78BFA',
};
