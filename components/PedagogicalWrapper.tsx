// components/PedagogicalWrapper.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Screen wrapper pour le mode pédagogique.
// Lit les plans dans usePedagogicalStore (pas de params de navigation).
// ─────────────────────────────────────────────────────────────────────────────
import { Text, View } from 'react-native';

import { router } from 'expo-router';
import { usePedagogicalStore } from '../store/usePedagogicalStore';
import { PedagogicalModeScreen } from './PedagogicalModeScreen';

export default function PedagogicalWrapper() {
  const { planA, planB, clear } = usePedagogicalStore();

  const handleClose = () => {
    clear();               // libère la mémoire
    router.back();
  };

  if (!planA) {
    // Ne devrait jamais arriver si RuntimeScreen appelle setPlans avant navigate
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Aucun plan disponible.</Text>
      </View>
    );
  }

  return (
    <PedagogicalModeScreen
      plan={planA}
      comparisonPlan={planB}
      onClose={handleClose}
    />
  );
}
