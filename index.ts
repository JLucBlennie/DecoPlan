import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// ─────────────────────────────────────────────────────────────────────────────
// DecoPlan — Mode pédagogique : exports publics
// ─────────────────────────────────────────────────────────────────────────────

// Écran principal
export { PedagogicalModeScreen } from './components/PedagogicalModeScreen';

// Hook de simulation
export { usePedagogicalSimulation } from './hooks/usePedagogicalSimulation';

// Composants réutilisables
export { CompartmentsPanel } from './components/CompartmentsPanel';
export { DiveProfileView } from './components/DiveProfileView';
export { DiveStatusPanel } from './components/DiveStatusPanel';
export { GasConsumptionPanel } from './components/GasConsumptionPanel';
export { ManometerGauge } from './components/ManometerGauge';
export { TimelineControls } from './components/TimelineControls';

// MN90
export { getMN90Profile } from './lib/dive/mn90';

// Types
export type { DecoModel, DivePlan, GasConso as Gas, GasRole, MN90Profile, MN90Stop, PedagogicalModeProps, PedagogicalSimulation, ProfileSegment, SimulationFrame, TissueState } from './lib/dive/types';

// Constantes (utiles pour les tests)
export { NC, ZHL16C_HE, ZHL16C_N2 } from './lib/dive/constants';

