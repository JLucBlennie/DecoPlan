/**
 * DecoPlan – Choix de blocs pour un volume de gaz donné.
 *
 * Capacité utile d'un bloc (L détendus) = volume × (pression de gonflage − réserve).
 * Le « meilleur » choix est la capacité utile totale la plus proche du besoin (sans le
 * dépasser), à égalité le moins de blocs.
 */

export interface BlockSize {
  volumeL: number;
  pressureBar: number;
}

export interface BlockSuggestion {
  block: BlockSize;
  count: number;
  /** Capacité utile totale des blocs proposés, réserve déduite (L détendus). */
  capacityL: number;
  /** Réserve laissée dans chaque bloc (bar). */
  reserveBar: number;
}

/** Gaz de fond : blocs courants, en 230 bar. */
export const BOTTOM_BLOCKS: readonly BlockSize[] = [
  { volumeL: 12, pressureBar: 230 },
  { volumeL: 15, pressureBar: 230 },
];

/** Gaz de déco : un bloc de 7 L / 200 bar par gaz. */
export const DECO_BLOCKS: readonly BlockSize[] = [{ volumeL: 7, pressureBar: 200 }];

/** Bail-out d'une plongée en recycleur : 7 L / 200 bar ou 11 L / 200 bar (S80). */
export const BAILOUT_BLOCKS: readonly BlockSize[] = [
  { volumeL: 7, pressureBar: 200 },
  { volumeL: 11, pressureBar: 200 },
];

/** Capacité utile d'un bloc : réserve déduite (jamais négative). */
export function blockCapacityL(block: BlockSize, reserveBar = 0): number {
  return block.volumeL * Math.max(0, block.pressureBar - reserveBar);
}

/** Nombre de blocs de cette taille pour couvrir `litres` en gardant la réserve (au moins 1 si besoin). */
export function suggestBlocks(litres: number, block: BlockSize, reserveBar = 0): BlockSuggestion {
  const capacity = blockCapacityL(block, reserveBar);
  const count = litres > 0 && capacity > 0 ? Math.ceil(litres / capacity) : 0;
  return { block, count, capacityL: count * capacity, reserveBar };
}

/** Une proposition par taille de bloc, dans l'ordre donné. */
export function suggestAll(litres: number, blocks: readonly BlockSize[], reserveBar = 0): BlockSuggestion[] {
  return blocks.map(b => suggestBlocks(litres, b, reserveBar));
}

/** Proposition la plus économe : capacité totale minimale, puis nombre de blocs minimal. */
export function bestSuggestion(suggestions: readonly BlockSuggestion[]): BlockSuggestion | undefined {
  return [...suggestions].sort(
    (a, b) => a.capacityL - b.capacityL || a.count - b.count,
  )[0];
}

/** « 2 × 12 L/230 b » */
export function formatSuggestion(s: BlockSuggestion): string {
  return `${s.count} × ${s.block.volumeL} L/${s.block.pressureBar} b`;
}
