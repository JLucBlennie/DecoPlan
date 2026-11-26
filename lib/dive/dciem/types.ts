export interface DciemStop {
  /** Profondeur du palier (m). */
  depthM: number;
  /** Attente au palier (min), arrondie à la minute supérieure. */
  durationMin: number;
}

export interface DciemParameters {
  /** Profondeur maximale (m). */
  depthM: number;
  /** Temps de plongée (min) depuis la surface jusqu'au début de la remontée, descente comprise. */
  diveTimeMin: number;
  /** Vitesse de descente (m/min). */
  descentRateMMin: number;
  /** Vitesse de remontée du fond au 1er palier (m/min). */
  ascentRateMMin: number;
  /** Vitesse de remontée entre paliers et jusqu'à la surface (m/min). */
  ascentRateBetweenStopsMMin: number;
}

export interface DciemResult {
  depthM: number;
  diveTimeMin: number;
  stops: DciemStop[];
  /** Durée totale de la remontée : trajets + paliers (min). */
  totalAscentTimeMin: number;
  /** Plongée sans palier au sens du modèle (aucune attente > 0). */
  noStop: boolean;
}
