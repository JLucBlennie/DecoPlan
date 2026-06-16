// app/_layout.tsx
// Remplace navigation/AppNavigator.tsx.
// Expo Router lit ce fichier automatiquement comme layout racine.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useGazStore } from '../store/useGazStore';
import { usePlongeeStore } from '../store/usePlongeeStore';
import { ocean } from '../styles/theme';

export default function RootLayout() {
  const { initializeGazList }     = useGazStore();
  const { initializePlongeeList } = usePlongeeStore();

  useEffect(() => {
    initializeGazList();
    initializePlongeeList();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle:         { backgroundColor: ocean.bg.deep },
          headerTintColor:     ocean.text.primary,
          headerTitleStyle:    { fontWeight: '500', fontSize: 17 },
          headerShadowVisible: false,
          contentStyle:        { backgroundColor: ocean.bg.deep },
        }}
      >
        {/* Accueil — pas de header (MenuPrincipal gère le sien) */}
        <Stack.Screen name="index"            options={{ headerShown: false }} />

        {/* Gaz */}
        <Stack.Screen name="gestion-gaz"      options={{ title: 'Gaz' }} />
        <Stack.Screen name="add-gaz"          options={{ ...modal, title: 'Nouveau gaz' }} />
        <Stack.Screen name="edit-gaz"         options={{ ...modal, title: 'Modifier le gaz' }} />

        {/* Plongées */}
        <Stack.Screen name="gestion-plongee"  options={{ title: 'Plongées' }} />
        <Stack.Screen name="add-plongee"      options={{ ...modal, title: 'Nouvelle plongée' }} />
        <Stack.Screen name="edit-plongee"     options={{ ...modal, title: 'Modifier la plongée' }} />

        {/* Runtime */}
        <Stack.Screen name="runtime"          options={{ title: 'Calcul déco' }} />

        {/* À propos */}
        <Stack.Screen name="about"            options={{ title: 'À propos' }} />

        {/* Mode pédagogique — plein écran, pas de header */}
        <Stack.Screen
          name="pedagogical"
          options={{
            headerShown:  false,
            presentation: 'fullScreenModal',
            animation:    'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}

// Options partagées pour les modales formulaires
const modal = {
  presentation:        'modal' as const,
  headerStyle:         { backgroundColor: ocean.bg.surface },
  headerTintColor:     ocean.text.primary,
  headerTitleStyle:    { fontWeight: '500' as const, fontSize: 17 },
  headerShadowVisible: false,
  contentStyle:        { backgroundColor: ocean.bg.surface },
};

// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — Mode pédagogique : exports publics
// ─────────────────────────────────────────────────────────────────────────────

// Écran principal
export { PedagogicalModeScreen } from '../components/PedagogicalModeScreen';

// Hook de simulation
export { usePedagogicalSimulation } from '../hooks/usePedagogicalSimulation';

// Composants réutilisables
export { CompartmentsPanel } from '../components/CompartmentsPanel';
export { DiveProfileView } from '../components/DiveProfileView';
export { DiveStatusPanel } from '../components/DiveStatusPanel';
export { GasConsumptionPanel } from '../components/GasConsumptionPanel';
export { ManometerGauge } from '../components/ManometerGauge';
export { TimelineControls } from '../components/TimelineControls';

// MN90
export { getMN90Profile } from '../lib/dive/mn90';

// Types
export type { DecoModel, DivePlan, GasConso as Gas, GasRole, MN90Profile, MN90Stop, PedagogicalModeProps, PedagogicalSimulation, ProfileSegment, SimulationFrame, TissueState } from '../lib/dive/types';

// Constantes (utiles pour les tests)
export { NC, ZHL16C_HE, ZHL16C_N2 } from '../lib/dive/constants';

