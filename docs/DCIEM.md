# Le modèle de décompression DCIEM

Document de référence pour le modèle DCIEM tel qu'il est utilisé dans DecoPlan
(`lib/dive/dciem/`) pour la **comparaison** avec Bühlmann ZHL-16C et les tables MN90.

## 1. Origine

- **DCIEM** : *Defence and Civil Institute of Environmental Medicine* (Canada, Toronto).
- Le modèle descend de **Kidd & Stubbs** (programme lancé en 1962). Il a d'abord existé
  sous forme d'un **ordinateur de décompression pneumatique** (le PADC) : des cavités reliées
  par des résistances à écoulement de gaz simulaient les tissus. Il a ensuite été programmé
  dans l'ordinateur numérique XDC-2.
- **KS-1971** : la version « historique », réglée à partir des tables US Navy.
- **DCIEM 1983** : la version modifiée par **Nishi & Lauckner** (rapport DCIEM 84-R-44),
  recalée avec des mesures de bulles par **Doppler**. C'est elle qui a servi à calculer les
  tables DCIEM (Diving Manual, dernière édition 1992). C'est celle qu'implémente DecoPlan.

## 2. Ce qui le distingue de Bühlmann

| | Bühlmann ZHL-16C | DCIEM 1983 |
|---|---|---|
| Compartiments | 16, **en parallèle** (chacun voit directement l'air respiré) | 4, **en série** (le gaz passe de l'un à l'autre) |
| Cinétique | Exponentielle, linéaire (demi-périodes fixes) | **Non linéaire** : l'équation dépend de la pression |
| Captation / élimination | Symétriques | **Asymétriques** : la captation est plus rapide que l'élimination |
| Limite de remontée | Valeurs M par compartiment (+ gradient factors) | Profondeur de remontée sûre **SAD**, calculée sur les compartiments 1 et 2 |
| Réglage | Coefficients a/b issus de tables | Ajusté sur des plongées avec mesures de bulles Doppler |
| Successives | Gérées par l'état des tissus | Idem (état des compartiments), avec facteurs de répétition dans les tables |

Conséquence pratique : DCIEM est assez prudent sur les **courtes expositions** (sa limite
sans palier à 30 m est d'environ 15 min, contre ~25 min à l'US Navy), et ses paliers
deviennent longs pour les **longues expositions**.

## 3. Les équations

Les pressions sont des **pressions absolues en msw** (mètres d'eau de mer). La pression
en surface vaut `Psl = 10,06`. Les 4 compartiments `P1…P4` sont en série, `P0` est la
pression ambiante :

```
dP1/dt = A·[(B + P0 + P1)(P0 − P1) − (B + P1 + P2)(P1 − P2)]
dP2/dt = A·[(B + P1 + P2)(P1 − P2) − (B + P2 + P3)(P2 − P3)]
dP3/dt = A·[(B + P2 + P3)(P2 − P3) − (B + P3 + P4)(P3 − P4)]
dP4/dt = A·[(B + P3 + P4)(P3 − P4)]
```

- `A = 0,0002596` et `B = 83,67` (constantes d'écoulement, pour l'air).
- Le terme `(B + Pi-1 + Pi)` rend le débit **dépendant de la pression** : plus la pression
  est élevée, plus il est facile de faire entrer du gaz que d'en faire sortir.
- Quand `B` est très grand devant les pressions, on retrouve un modèle linéaire classique
  avec une demi-période `T½ = ln 2 / k`.
- Dans DecoPlan, ces équations sont intégrées par **Runge-Kutta d'ordre 4**, au pas de
  3 secondes (`compartments.ts`), la pression ambiante variant linéairement pendant la
  descente et la remontée.

## 4. Le critère de remontée : la SAD

La **profondeur de remontée sûre** (*Safe Ascent Depth*) est la profondeur minimale à laquelle
on peut monter à un instant donné :

```
SAD = Pt / R − OFF − Psl
```

avec `Pt` la pression du compartiment considéré. Le terme `OFF` rend le rapport de
sursaturation **dépendant de la profondeur** (plus prudent quand on est profond).

Le rapport de sursaturation équivalent est `SR = R / (1 − R·OFF / Pt)`.

### Paramètres 1983 (compartiments surveillés)

| Compartiment | R | OFF (msw) | Rapport en surface |
|---|---|---|---|
| 1 | 1,3 | 4,8 | 1,92 (KS-1971 : 1,8) |
| 2 | 1,385 | 2,5 | 1,73 (KS-1971 : 1,8) |
| 3 et 4 | — | — | **non surveillés** (ils servent seulement au calcul des pressions) |

On retient la **plus profonde** des deux SAD. Ne pas surveiller les compartiments 3 et 4
supprime la « longue queue » de décompression de KS-1971 sur les longues expositions.

## 5. Procédure de décompression

1. Descente (18 m/min ou moins pour les tables).
2. Remontée vers le **premier palier**, multiple de 3 m.
3. À chaque palier, on **attend que la SAD autorise le palier suivant** (3 m plus haut).
4. La plongée se termine quand la SAD permet de remonter en surface.

Dans les tables DCIEM, la durée d'un palier **inclut le trajet** depuis le palier précédent.
La **vitesse de remontée** n'est pas un paramètre du modèle (18 m/min, ±3), le temps de trajet
passe simplement dans le calcul des compartiments.

## 6. Plongées successives

Le modèle n'a pas de règle spéciale : l'état des 4 compartiments à la sortie de l'eau se
poursuit pendant l'intervalle en surface (`P0 = Psl`). Les tables, elles, passent par un
**groupe répétitif** (A à M) et un **facteur de répétition** lus dans une table intervalle de
surface × groupe, qui majore le temps de la plongée suivante. Après environ 18 h, on
considère que le plongeur est revenu à l'état de plongée unique. *(Non implémenté dans
DecoPlan à ce jour : seul le mode « plongée simple » est branché.)*

## 7. Ce qu'il y a dans DecoPlan

Dossier `lib/dive/dciem/` (un fichier = une responsabilité) :

| Fichier | Rôle |
|---|---|
| `constants.ts` | `A`, `B`, `Psl`, `R`, `OFF`, pas de 3 m — avec les sources en en-tête |
| `compartments.ts` | Équations 1 à 4 et pas Runge-Kutta 4 |
| `safeAscentDepth.ts` | Calcul de la SAD |
| `computeDciemDive.ts` | Descente, fond, remontée par paliers |
| `dciemProfile.ts` | Adaptateur : plan de plongée → profil au format MN90 (pour l'affichage) |
| `computeDciemDive.test.ts` | Tests contre les tables officielles |

**Affichage** : mode pédagogique, bouton « DCIEM », tracé violet et légende
« DCIEM (modèle calculé) ». Ce n'est **pas** une lecture de table : le résultat est calculé,
avec les vitesses de descente et de remontée des préférences, pour un profil carré
(profondeur maximale, temps de plongée descente comprise, comme MN90).

Tests : `npx tsx --test lib/dive/dciem/computeDciemDive.test.ts`

## 8. Validation

Valeurs relevées dans la Table 1 « Standard Air Decompression (metres) » du DCIEM Diving
Manual (1992), descente et remontée à 18 m/min. Les valeurs des tables ne sont **pas**
embarquées dans l'application : elles ne servent qu'aux tests.

| Plongée | Calculé | Table |
|---|---|---|
| 30 m / 30 min | 6 m : 4 · 3 m : 10 | 6 m : 5 · 3 m : 10 |
| 30 m / 110 min | 12 m : 3 · 9 m : 9 · 6 m : 38 · 3 m : 106 | 12 m : 4 · 9 m : 8 · 6 m : 38 · 3 m : 106 |
| 24 m / 110 min | 9 m : 2 · 6 m : 12 · 3 m : 64 | 9 m : 2 · 6 m : 12 · 3 m : 64 |
| 18 m / 90 min | 3 m : 16 | 3 m : 16 |
| 15 m / 280 min | 3 m : 91 | 3 m : 91 |
| 12 m / 300 min | 3 m : 44 | 3 m : 44 |
| 27 m / 120 min | 9 m : 7 · 6 m : 31 · 3 m : 95 | 9 m : 8 · 6 m : 31 · 3 m : 95 |

Les paliers calculés sont à ±2 min des tables. Les tables sont un peu **plus prudentes sur
les premiers paliers** (+1 min environ), probablement par arrondi et par l'expérience
accumulée.

### Écart connu : la limite sans palier

Les tables donnent 50 min à 18 m, 25 min à 24 m, 15 min à 30 m sans palier. Le modèle
calculé exige alors un petit palier de 3 m (3 à 4 min) : les tables n'affichent pas de palier
aussi court dans la zone de transition. Pour la comparaison avec Bühlmann, c'est un écart de
quelques minutes, dans le sens prudent.

## 9. Limites et usage

- **Comparaison uniquement** : DecoPlan ne remplace pas les tables officielles.
- Modèle **à l'air** : pas de nitrox, d'oxygène ou de mélanges fond (le rapport 84-R-44 traite
  aussi l'oxygène en immersion ou en surface, non implémenté).
- Pas de plongée en altitude (`Psl` fixé à 10,06 msw).
- Profil carré : pas de multi-niveaux.

## Sources

- R.Y. Nishi, G.R. Lauckner, *Development of the DCIEM 1983 Decompression Model for Compressed
  Air Diving*, DCIEM No. 84-R-44, Downsview (Ontario), septembre 1984.
- *DCIEM Diving Manual*, 1992, Table 1 (metres).
- CMAS, fiche DCIEM : <https://www.cmas.org/fact-sheets/dciem-fra.html>
- Kidd & Stubbs (1971) et Nishi & Kuehn (1973) : cités par le rapport ci-dessus.
