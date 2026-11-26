/**
 * Modèle DCIEM 1983 pour la plongée à l'air — constantes.
 *
 * Source : R.Y. Nishi, G.R. Lauckner, « Development of the DCIEM 1983
 * Decompression Model for Compressed Air Diving », DCIEM Report No. 84-R-44,
 * Defence and Civil Institute of Environmental Medicine, Canada, sept. 1984
 * (pdf fourni par l'utilisateur) :
 *  - équations (1) à (4) : A = 0,0002596 et B = 83,67 (air, pressions en msw) ;
 *  - équation (6) : SAD = Pt/R − OFF − Psl, avec Psl = 10,06 msw ;
 *  - §« Summary » : compartiment 1 → R = 1,3 / OFF = 4,8 ;
 *    compartiment 2 → R = 1,385 / OFF = 2,5 ; compartiments 3 et 4 non surveillés ;
 *  - procédure : paliers tous les 3 msw (10 fsw), le plongeur reste au palier tant
 *    que la SAD ne permet pas de monter au suivant.
 *
 * ⚠️ Modèle de COMPARAISON : ce n'est pas la lecture des tables officielles
 * (DCIEM Diving Manual 1992), même si ses paliers en sont très proches.
 */

/** Constante d'écoulement du gaz « A » (air, pressions en msw). */
export const FLOW_A = 0.0002596;

/** Constante d'écoulement « B » : donne la non-linéarité (captation plus rapide que l'élimination). */
export const FLOW_B = 83.67;

/** Pression au niveau de la mer (msw), utilisée dans l'équation de la SAD. */
export const SEA_LEVEL_MSW = 10.06;

/** Nombre de compartiments en série. */
export const COMPARTMENT_COUNT = 4;

/** Constantes de sursaturation « R » des compartiments surveillés (1 et 2). */
export const SUPERSATURATION_R: readonly number[] = [1.3, 1.385];

/** Constantes de sursaturation « OFF » des compartiments surveillés (1 et 2), en msw. */
export const SUPERSATURATION_OFF: readonly number[] = [4.8, 2.5];

/** Espacement des paliers (m). */
export const STOP_INTERVAL_M = 3;
