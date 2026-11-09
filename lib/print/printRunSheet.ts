/**
 * DecoPlan – Impression de la fiche des runtimes
 *
 *   Android / iOS : PDF A4 (expo-print) puis partage (enregistrer, imprimer, envoyer)
 *   Web / Tauri   : impression du navigateur, dans un cadre masqué
 *
 * La mise en page est dans lib/dive/printable (fonctions pures, testables).
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { buildRunSheetHtml, type RunSheetOptions, type WhatIfResult } from '../dive';

/** A4 à 72 ppp : format de page attendu par expo-print. */
const A4_NATIVE_PX = { width: 595, height: 842 } as const;

/** A4 à 96 ppp : largeur de page d'un navigateur. */
const A4_BROWSER_PX = { width: 794, height: 1123 } as const;

export async function printRunSheet(
  result: WhatIfResult,
  options: Omit<RunSheetOptions, 'pageWidthPx'>,
): Promise<void> {
  if (Platform.OS === 'web') {
    printInHiddenFrame(buildRunSheetHtml(result, { ...options, pageWidthPx: A4_BROWSER_PX.width }));
    return;
  }

  const html = buildRunSheetHtml(result, { ...options, pageWidthPx: A4_NATIVE_PX.width });
  const { uri } = await Print.printToFileAsync({ html, ...A4_NATIVE_PX });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Runtimes à imprimer',
    });
  } else {
    await Print.printAsync({ uri });
  }
}

/**
 * Sur le web, Print.printAsync() imprime la page courante : on charge donc la fiche
 * dans un cadre hors écran et on imprime ce cadre.
 */
function printInHiddenFrame(html: string): void {
  const frame = document.createElement('iframe');
  frame.style.cssText =
    `position:fixed;left:-10000px;top:0;border:0;width:${A4_BROWSER_PX.width}px;height:${A4_BROWSER_PX.height}px`;
  frame.srcdoc = html;
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) {
      frame.remove();
      return;
    }
    win.onafterprint = () => frame.remove();
    win.focus();
    win.print();
  };
  document.body.appendChild(frame);
}
