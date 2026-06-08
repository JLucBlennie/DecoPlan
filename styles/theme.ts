/**
 * DecoPlan – Ocean Theme
 * Tokens de design centralisés. Importer `ocean` dans les composants
 * plutôt que d'écrire des couleurs en dur.
 */

export const ocean = {
  // ── Fonds ────────────────────────────────────────────────────────────────
  bg: {
    deep:    '#0d1b2a',   // fond principal (SafeAreaView / écrans)
    surface: '#132130',   // cartes, boutons, inputs
    raised:  '#1a2e40',   // éléments surélévés (hover, focus)
    overlay: '#0a1520',   // header, table header
  },

  // ── Bordures ─────────────────────────────────────────────────────────────
  border: {
    subtle:  '#1a3a52',   // bordure par défaut
    muted:   '#0f2535',   // séparateurs très discrets
    strong:  '#2a5070',   // bordure active / focus
  },

  // ── Textes ───────────────────────────────────────────────────────────────
  text: {
    primary:   '#e2f0ff',   // titres, valeurs importantes
    secondary: '#8ab0cc',   // labels, sous-titres
    muted:     '#4a7090',   // hints, placeholders
    inverse:   '#0d1b2a',   // texte sur fond clair (badges)
  },

  // ── Accents sémantiques ──────────────────────────────────────────────────
  accent: {
    blue:   '#378add',   // actions principales, info
    teal:   '#1d9e75',   // succès, confirmations
    purple: '#9b5de5',   // paliers deco (couleur dédiée algo)
    green:  '#6dbe3a',   // CTA "Calculer" (action critique)
    amber:  '#e09020',   // avertissements
    red:    '#e24b4a',   // erreurs, suppression
  },

  // ── Teintes douces (backgrounds de badges / pills) ───────────────────────
  soft: {
    blue:   '#0e2a45',
    teal:   '#062a1e',
    purple: '#1e0a35',
    green:  '#102808',
    amber:  '#2a1a02',
    red:    '#2a0808',
  },
} as const;

/**
 * Espacements et rayons standardisés
 */
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;

export const radius = {
  sm:  6,
  md:  10,
  lg:  14,
  xl:  20,
  full: 9999,
} as const;

/**
 * Tailles de police
 */
export const fontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  26,
  hero: 32,
} as const;
