// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — PedagogicalLaunchButton
// Bouton d'entrée + sheet intégrée. S'auto-suffit sur l'écran de la plongée.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import type { Plan } from '../lib/dive/buhlmann';
import type { DivePlan } from '../lib/dive/types';
import { PedagogicalConfigSheet } from './PedagogicalConfigSheet';

export interface PedagogicalLaunchButtonProps {
  plan:          Plan;
  planName:      string;
  currentGfLow:  number;
  currentGfHigh: number;
  onLaunch:      (planA: DivePlan, planB: DivePlan | undefined) => void;
  /** Variante d'affichage */
  variant?: 'button' | 'fab' | 'menuItem';
}

export function PedagogicalLaunchButton({
  plan, planName, currentGfLow, currentGfHigh, onLaunch,
  variant = 'button',
}: PedagogicalLaunchButtonProps) {
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <>
      {variant === 'button' && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>🎓</Text>
          <Text style={styles.label}>Mode pédagogique</Text>
        </TouchableOpacity>
      )}

      {variant === 'fab' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>🎓</Text>
        </TouchableOpacity>
      )}

      {variant === 'menuItem' && (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setSheetVisible(true)}
        >
          <Text style={styles.menuIcon}>🎓</Text>
          <Text style={styles.menuLabel}>Mode pédagogique</Text>
          <Text style={styles.menuChevron}>›</Text>
        </TouchableOpacity>
      )}

      <PedagogicalConfigSheet
        plan={plan}
        planName={planName}
        currentGfLow={currentGfLow}
        currentGfHigh={currentGfHigh}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onLaunch={(planA, planB) => {
          setSheetVisible(false);
          onLaunch(planA, planB);
        }}
      />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  button: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(55,138,221,0.15)',
    borderRadius: 12, borderWidth: 0.5, borderColor: '#378ADD',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  icon:  { fontSize: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#85B7EB' },

  fab: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#185FA5',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  fabIcon: { fontSize: 22 },

  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  menuIcon:    { fontSize: 18, width: 26 },
  menuLabel:   { flex: 1, fontSize: 15, color: '#E8E8E6' },
  menuChevron: { fontSize: 20, color: '#444441' },
});

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLE D'INTÉGRATION COMPLET
// À copier/adapter dans votre écran de résultat de plongée.
// ─────────────────────────────────────────────────────────────────────────────
//
// import React from 'react';
// import { View } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
//
// import { Plan, ZH16CTissues } from '../buhlmann';
// import { Gas }                from '../gas';
// import { PedagogicalLaunchButton } from '../pedagogical/bridge/PedagogicalLaunchButton';
// import type { DivePlan }           from '../pedagogical/types';
//
// const GF_LOW  = 0.30;
// const GF_HIGH = 0.85;
//
// export function DivePlanResultScreen() {
//   const navigation = useNavigation();
//
//   // ── Calcul de la plongée (déjà dans votre app) ────────────────────────
//   const plan = new Plan(ZH16CTissues, 1.0, false);
//   const air  = new Gas('Air',   0.21, 0);
//   const ean50 = new Gas('EAN50', 0.50, 0);
//
//   plan.addBottomGas(air);
//   plan.addDecoGas(ean50);
//   plan.addDepthChange(0, 30, 'Air', 2);
//   plan.addFlat(30, 'Air', 20);
//   plan.calculateDecompression(false, GF_LOW, GF_HIGH);
//
//   // ── Handler de lancement ─────────────────────────────────────────────
//   const handleLaunch = (planA: DivePlan, planB: DivePlan | undefined) => {
//     navigation.navigate('PedagogicalMode', { planA, planB });
//   };
//
//   return (
//     <View style={{ flex: 1 }}>
//       {/* ... votre contenu existant ... */}
//
//       {/* Bouton mode pédagogique — choisir la variante selon votre UI */}
//       <PedagogicalLaunchButton
//         plan={plan}
//         planName="Tombant 30m"
//         currentGfLow={GF_LOW}
//         currentGfHigh={GF_HIGH}
//         onLaunch={handleLaunch}
//         variant="button"          // 'button' | 'fab' | 'menuItem'
//       />
//     </View>
//   );
// }
//
// ── PedagogicalModeScreen dans le navigateur ──────────────────────────────────
//
// Dans votre Stack.Navigator :
//
// import { PedagogicalModeScreen } from '../pedagogical/PedagogicalModeScreen';
//
// <Stack.Screen
//   name="PedagogicalMode"
//   component={PedagogicalModeWrapper}
//   options={{ presentation: 'fullScreenModal', headerShown: false }}
// />
//
// function PedagogicalModeWrapper({ route, navigation }) {
//   const { planA, planB } = route.params;
//   return (
//     <PedagogicalModeScreen
//       plan={planA}
//       comparisonPlan={planB}
//       onClose={() => navigation.goBack()}
//     />
//   );
// }
