/**
 * DecoPlan – Shared Styles
 *
 * Styles structurels réutilisés par plusieurs écrans/composants.
 * Ne contient PAS de couleurs en dur : toutes les valeurs viennent de theme.ts.
 *
 * Règle d'usage :
 *   - Un style qui apparaît dans 2 composants ou plus → ici.
 *   - Un style propre à un seul composant → dans le StyleSheet local de ce composant.
 */

import { Platform, StyleSheet } from 'react-native';
import { ocean, spacing, radius, fontSize } from './theme';

export const sharedStyles = StyleSheet.create({

  // ── Conteneurs d'écran ────────────────────────────────────────────────────

  /**
   * Wrapper racine (SafeAreaView dans App.tsx).
   * Remplace mainStyles.container.
   */
  safeArea: {
    flex: 1,
    backgroundColor: ocean.bg.deep,
    alignSelf: 'stretch',
    ...Platform.select({
      web: { maxWidth: '100%' },
    }),
  },

  /**
   * Conteneur intérieur de chaque écran/éditeur.
   * Remplace mainStyles.editorContainer.
   * flex-start en vertical : le contenu s'empile depuis le haut.
   */
  screenContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: ocean.bg.deep,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // ── Typographie ───────────────────────────────────────────────────────────

  /**
   * Texte courant (valeurs, descriptions).
   * Remplace mainStyles.text.
   */
  bodyText: {
    fontSize: fontSize.md,
    color: ocean.text.primary,
  },

  /**
   * Texte secondaire (labels, sous-titres).
   */
  secondaryText: {
    fontSize: fontSize.sm,
    color: ocean.text.secondary,
  },

  /**
   * Titre d'écran (ex : "Liste des gaz").
   * Remplace mainStyles.titre.
   */
  screenTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: ocean.text.primary,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },

  /**
   * Label de section en capitales (ex : "NAVIGATION", "GAZ CONFIGURÉS").
   */
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: ocean.text.muted,
    letterSpacing: 0.1,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },

  // ── Bandeau disclaimer ────────────────────────────────────────────────────

  /**
   * Remplace mainStyles.attentionText (le bloc ALL CAPS rouge).
   * Un seul endroit dans l'app devrait l'afficher : RuntimeResult.
   */
  disclaimer: {
    alignSelf: 'stretch',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: ocean.soft.amber,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: ocean.accent.amber,
    marginTop: spacing.md,
  },
  disclaimerText: {
    fontSize: fontSize.xs,
    color: ocean.accent.amber,
  },

  // ── Séparateur ────────────────────────────────────────────────────────────

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ocean.border.subtle,
    alignSelf: 'stretch',
    marginVertical: spacing.md,
  },
});
