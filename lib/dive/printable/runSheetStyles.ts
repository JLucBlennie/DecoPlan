/**
 * DecoPlan – Fiche imprimable : feuille de style
 *
 * Mise en page pensée pour une page A4 de 595 px de large (A4 à 72 ppp : réglage de
 * expo-print). Sur un navigateur (A4 à 96 ppp), `zoom` agrandit l'ensemble en proportion.
 */

/** Largeur de page de référence (px). */
export const REFERENCE_PAGE_WIDTH_PX = 595;

export function runSheetCss(zoom: number): string {
  return `
@page { margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; padding: 0; background: #fff; color: #000;
  font-family: Calibri, Carlito, "Segoe UI", Roboto, Arial, sans-serif; }
.sheet { width: ${REFERENCE_PAGE_WIDTH_PX}px; padding: 20px 22px; zoom: ${zoom}; }

.title { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.title h1 { margin: 0; font-size: 20px; }
.title .meta { font-size: 11px; color: #333; text-align: right; }
.legend { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; }
.chip { font-size: 13px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #111; }
.notes { margin: 0 0 10px; font-size: 10px; color: #333; line-height: 1.35; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 10px; align-items: start; }
.block { break-inside: avoid; page-break-inside: avoid; border: 2px solid #1F2A44; border-radius: 4px; overflow: hidden; }
.block-head { display: flex; justify-content: space-between; align-items: baseline; gap: 6px;
  background: #1F2A44; color: #fff; padding: 4px 6px; font-weight: 700; font-size: 14px; line-height: 18px; }
.block-head .total { font-size: 15px; white-space: nowrap; }

table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th { font-size: 10px; font-weight: 700; color: #444; text-transform: uppercase; padding: 2px 4px; text-align: right; background: #eee; }
th:first-child { text-align: left; }
td { font-size: 14px; font-weight: 700; line-height: 20px; padding: 0 4px; text-align: right; white-space: nowrap;
  font-variant-numeric: tabular-nums; border-top: 1px solid #fff; overflow: hidden; }
td:first-child { text-align: left; }
td.gas { text-align: center; font-size: 13px; }
tr.starts-gas td { border-top: 3px solid #111; }
.block-warn { font-size: 10px; font-weight: 700; padding: 3px 6px; background: #FFF2CC; border-top: 1px solid #111; }
`;
}
