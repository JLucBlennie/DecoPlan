/**
 * DecoPlan – CCR : types de configuration.
 */

export interface CcrConfig {
  /** Nom du gaz diluant (1 seul diluant par plongée). */
  diluentName: string;
  /** Set point bas (bar de ppO₂), utilisé en surface et au début de la descente. */
  setpointLowBar: number;
  /** Set point haut (bar de ppO₂), utilisé au fond et pendant la déco. */
  setpointHighBar: number;
  /** Profondeur (m) à laquelle on passe du set point bas au haut en descente. */
  switchDepthM: number;
  /**
   * Profondeur (m) sous laquelle on repasse au set point bas en remontée.
   * `undefined` = on garde le set point haut jusqu'en surface.
   */
  ascentLowSwitchDepthM?: number;
}

/** Valeurs par défaut courantes (CCR loisir/technique). */
export const DEFAULT_CCR_SETPOINTS = {
  setpointLowBar: 0.7,
  setpointHighBar: 1.3,
  switchDepthM: 20,
} as const;
