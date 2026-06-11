/**
 * DecoPlan – Types de données
 *
 * Interfaces pures = objets sérialisables sans perte via JSON/AsyncStorage.
 * Aucune logique ici, uniquement la forme des données.
 */

export interface GasData {
  id: string;
  name: string;
  fO2: number;   // fraction O₂  [0..1]
  fHe: number;   // fraction He  [0..1]
  fN2: number;   // fraction N₂  [0..1]  — toujours 1 - fO2 - fHe
}

export interface Segment {
  startDepth: number;   // mètres
  endDepth: number;     // mètres
  gasName: string;      // référence au Gas.name utilisé
  time: number;         // minutes
}

export interface Plongee {
  id: string;
  name: string;
  segments: Segment[];
  gazFond: GasData[];
  gazDeco: GasData[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — Mode pédagogique : types & interfaces
// ─────────────────────────────────────────────────────────────────────────────

// ── Gaz ──────────────────────────────────────────────────────────────────────

export type GasRole = 'bottom' | 'deco';

export interface GasConso {
  id: string;
  label: string;           // ex. "Air", "EAN50", "O2 100%"
  fO2: number;             // fraction O2, 0–1
  fN2: number;             // fraction N2, 0–1
  fHe: number;             // fraction He, 0–1  (Nitrox → 0)
  tankVolumeLiters: number;
  startPressureBar: number;
  role: GasRole;
  switchDepthM?: number;   // profondeur de changement de gaz (remontée)
}

// ── Profil de plongée ─────────────────────────────────────────────────────────

export interface ProfileSegment {
  startTimeMin: number;
  endTimeMin: number;
  startDepthM: number;
  endDepthM: number;
  gasId: string;
}

export type DecoModel = 'ZHL16C' | 'ZHL16B';

export interface DivePlan {
  id: string;
  name: string;
  gases: GasConso[];
  segments: ProfileSegment[];    // ordonnés chronologiquement
  model: DecoModel;
  gfLow: number;                 // ex. 0.30
  gfHigh: number;                // ex. 0.85
}

// ── Simulation ────────────────────────────────────────────────────────────────

export interface TissueState {
  n2PressuresBar: number[];      // pression N2 par compartiment
  hePressuresBar: number[];      // pression He par compartiment (0 si pas d'He)
}

export interface SimulationFrame {
  timeMin: number;
  depthM: number;
  pAmbBar: number;
  tissues: TissueState;
  /** Pression restante dans chaque bloc (clé = Gas.id) */
  gasRemainingBar: Record<string, number>;
  activeGasId: string;
  /** Index du compartiment le plus proche de sa valeur-M */
  leadingCompartmentIndex: number;
  /**
   * Ratio de saturation par compartiment :
   *   (P_tissue - P_surface_N2) / (M_value_GF - P_surface_N2)
   *   0 = équilibre surface, 1 = à la limite de déco
   */
  saturationRatios: number[];
}

export interface PedagogicalSimulation {
  frames: SimulationFrame[];
  totalTimeMin: number;
  dtMin: number;
  stepCount: number;
}

// ── MN90 ─────────────────────────────────────────────────────────────────────

export interface MN90Stop {
  depthM: number;
  durationMin: number;
}

export interface MN90Profile {
  maxDepthM: number;
  bottomTimeMin: number;
  stops: MN90Stop[];
  totalAscentTimeMin: number;
}

// ── Props composants ──────────────────────────────────────────────────────────

export interface PedagogicalModeProps {
  plan: DivePlan;
  /** Second plan pour la comparaison côte-à-côte (GF différents, gaz différents…) */
  comparisonPlan?: DivePlan;
  onClose: () => void;
}