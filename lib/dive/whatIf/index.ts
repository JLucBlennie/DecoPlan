export { computeScenarioRuntime, computeWhatIf } from './computeWhatIf';
export { bailoutLimitsFor, definitionFromPlongee, diluentLimitsFor } from './definitionFromPlongee';
export type { CcrSettings, DiveSettings } from './definitionFromPlongee';
export { deltaTrend, formatDeltaMinutes, formatMinutes } from './format';
export type { DeltaTrend } from './format';
export { computeRuntime, computeRuntimeSegments } from './runtime';
export type { RuntimeOptions } from './runtime';
export type { RuntimeComputation } from './runtime';
export { toRuntimeRows } from './runtimeRows';
export type { RuntimeRow } from './runtimeRows';
export { applicableKinds, applyScenario, DEFAULT_WHATIF_OPTIONS, scenarioLabel, WHATIF_KINDS } from './scenarios';
export type {
  DiveDefinition, RuntimeDelta, RuntimeGasNeed, RuntimeGasRole, RuntimeStop, RuntimeSummary, WhatIfKind, WhatIfOptions, WhatIfResult, WhatIfRuntime, WhatIfUnavailable
} from './types';
