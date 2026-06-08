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
