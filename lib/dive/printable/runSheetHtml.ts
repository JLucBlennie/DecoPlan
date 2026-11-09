/**
 * DecoPlan – Fiche imprimable : page HTML des runtimes (nominal + WhatIf)
 *
 * Fonction pure : retourne une page HTML autonome, à convertir en PDF (expo-print)
 * ou à imprimer depuis un navigateur. Voir lib/print/printRunSheet.ts.
 */

import type { WhatIfResult, WhatIfRuntime } from '../whatIf';
import { formatClock } from './clock';
import { assignGasColors, SWITCH_COLORS, type RunSheetColors } from './gasPalette';
import { buildRunSheetRows, type RunSheetPhase, type RunSheetRow } from './runSheetRows';
import { REFERENCE_PAGE_WIDTH_PX, runSheetCss } from './runSheetStyles';

export interface RunSheetOptions {
  /** Nom de la plongée. */
  title: string;
  /** Réglages utilisés pour le calcul (GF, vitesses…). */
  subtitle?: string;
  /** Date affichée en haut à droite. */
  dateLabel?: string;
  /** Largeur de page en px : 595 (défaut, A4 à 72 ppp, expo-print) ou 794 (A4 à 96 ppp, navigateur). */
  pageWidthPx?: number;
}

const PHASE_LABELS: Record<RunSheetPhase, string> = {
  LEVEL: 'Niveau',
  ASCENT: 'Rem.',
  STOP: 'Palier',
  SURFACE: 'Surf.',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colorStyle(colors: RunSheetColors): string {
  return `background:${colors.background};color:${colors.text}`;
}

function rowHtml(row: RunSheetRow, gasColors: Map<string, RunSheetColors>): string {
  const isSwitch = row.switchToGas !== undefined;
  const colors = isSwitch ? SWITCH_COLORS : gasColors.get(row.gasName)!;
  const gasLabel = isSwitch ? `▶ ${escapeHtml(row.switchToGas!)}` : escapeHtml(row.gasName);
  const duration = row.durationSec === null ? '' : formatClock(row.durationSec);

  return `<tr${row.startsGas ? ' class="starts-gas"' : ''} style="${colorStyle(colors)}">`
    + `<td>${PHASE_LABELS[row.phase]}</td>`
    + `<td>${Math.round(row.depthM * 10) / 10}</td>`
    + `<td>${duration}</td>`
    + `<td>${formatClock(row.runtimeSec)}</td>`
    + `<td class="gas">${gasLabel}</td>`
    + `</tr>`;
}

function blockHtml(runtime: WhatIfRuntime, rows: RunSheetRow[], gasColors: Map<string, RunSheetColors>): string {
  const total = rows.length > 0 ? formatClock(rows[rows.length - 1].runtimeSec) : '';
  const warnings = runtime.warnings
    .map(text => `<div class="block-warn">⚠ ${escapeHtml(text)}</div>`)
    .join('');

  return `<section class="block">`
    + `<div class="block-head"><span>${escapeHtml(runtime.label)}</span><span class="total">${total}</span></div>`
    + `<table>`
    + `<colgroup><col style="width:19%"><col style="width:14%"><col style="width:21%"><col style="width:23%"><col style="width:23%"></colgroup>`
    + `<thead><tr><th>Phase</th><th>Prof.</th><th>Durée</th><th>Runtime</th><th style="text-align:center">Gaz</th></tr></thead>`
    + `<tbody>${rows.map(row => rowHtml(row, gasColors)).join('')}</tbody>`
    + `</table>${warnings}</section>`;
}

function legendHtml(gasColors: Map<string, RunSheetColors>): string {
  const gasChips = [...gasColors.entries()]
    .map(([name, colors]) => `<span class="chip" style="${colorStyle(colors)}">${escapeHtml(name)}</span>`)
    .join('');
  const switchChip = `<span class="chip" style="${colorStyle(SWITCH_COLORS)}">▶ changer de gaz</span>`;
  return `<div class="legend">${gasChips}${switchChip}</div>`;
}

export function buildRunSheetHtml(result: WhatIfResult, options: RunSheetOptions): string {
  const zoom = (options.pageWidthPx ?? REFERENCE_PAGE_WIDTH_PX) / REFERENCE_PAGE_WIDTH_PX;

  const runtimes = [result.nominal, ...result.scenarios];
  const rowsByRuntime = runtimes.map(rt => buildRunSheetRows(rt.segments, rt.summary.bottomPhaseMin));

  // Le gaz de fond du nominal vient en premier : il garde l'orange sur toute la fiche.
  const gasColors = assignGasColors(rowsByRuntime.flatMap(rows => rows.map(row => row.gasName)));

  const blocks = runtimes.map((rt, i) => blockHtml(rt, rowsByRuntime[i], gasColors)).join('');
  const meta = [options.subtitle, options.dateLabel].filter(Boolean).map(text => escapeHtml(text!)).join('<br>');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<title>${escapeHtml(options.title)} – runtimes</title><style>${runSheetCss(zoom)}</style></head><body>`
    + `<div class="sheet">`
    + `<div class="title"><h1>${escapeHtml(options.title)}</h1><div class="meta">${meta}</div></div>`
    + legendHtml(gasColors)
    + `<p class="notes">Durée = remontée + palier. Runtime = temps écoulé depuis le départ, à la fin de la ligne. `
    + `Ligne verte : changer de gaz à cette profondeur. Calcul indicatif, non qualifié pour la plongée réelle.</p>`
    + `<div class="grid">${blocks}</div>`
    + `</div></body></html>`;
}
