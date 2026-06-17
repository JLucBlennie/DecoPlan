// navigation/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Avec Expo Router, le typage des routes est généré automatiquement dans
// .expo/types/ à partir de la structure app/.
//
// Ce fichier fournit uniquement les helpers de navigation pour les composants.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Routes de l'application (chemins Expo Router).
 * Utiliser ces constantes plutôt que des chaînes brutes.
 *
 * Usage :
 *   import { ROUTES } from '../navigation/types';
 *   router.push(ROUTES.GESTION_GAZ);
 *   router.push({ pathname: ROUTES.EDIT_GAZ, params: { gazId: gaz.id } });
 */
export const ROUTES = {
  HOME: '/' as const,
  GESTION_GAZ: '/gestion-gaz' as const,
  ADD_GAZ: '/add-gaz' as const,
  EDIT_GAZ: '/edit-gaz' as const,
  GESTION_PLONGEE: '/gestion-plongee' as const,
  ADD_PLONGEE: '/add-plongee' as const,
  EDIT_PLONGEE: '/edit-plongee' as const,
  RUNTIME: '/runtime' as const,
  PREFERENCES: '/preferences' as const,
  ABOUT: '/about' as const,
  PEDAGOGICAL: '/pedagogical' as const,
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

// ── Ce qui remplace useNavigation() ──────────────────────────────────────────
//
// AVANT (react-navigation) :
//   import { useNavigation } from '@react-navigation/native';
//   const navigation = useNavigation<AppNavProp>();
//   navigation.navigate('GestionGaz');
//   navigation.navigate('EditGaz', { gazId: gaz.id });
//   navigation.goBack();
//
// APRÈS (expo-router) :
//   import { useRouter } from 'expo-router';
//   const router = useRouter();
//   router.push(ROUTES.GESTION_GAZ);
//   router.push({ pathname: ROUTES.EDIT_GAZ, params: { gazId: gaz.id } });
//   router.back();
//
// ── Ce qui remplace useRoute() ────────────────────────────────────────────────
//
// AVANT :
//   import { useRoute } from '@react-navigation/native';
//   const { gazId } = useRoute<AppRouteProp<'EditGaz'>>().params;
//
// APRÈS :
//   import { useLocalSearchParams } from 'expo-router';
//   const { gazId } = useLocalSearchParams<{ gazId: string }>();
