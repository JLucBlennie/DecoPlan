/**
 * DecoPlan – WhatIf : point d'entrée
 *
 *   const result = computeWhatIf(definition);
 *   result.nominal            → runtime de référence
 *   result.scenarios[i].delta → écart avec le nominal
 */

import { computeRuntimeSegments } from './runtime';
import { applicableKinds, applyScenario, DEFAULT_WHATIF_OPTIONS, scenarioLabel } from './scenarios';
import { deltaFromNominal, summarizeRuntime } from './summary';
import type { DiveDefinition, WhatIfKind, WhatIfOptions, WhatIfResult, WhatIfRuntime } from './types';
import { collectWarnings } from './warnings';

/** Calcule le runtime d'un seul scénario (sans écart : voir computeWhatIf). */
export function computeScenarioRuntime(
  base: DiveDefinition,
  kind: WhatIfKind,
  options: WhatIfOptions = DEFAULT_WHATIF_OPTIONS,
): WhatIfRuntime {
  const def = applyScenario(base, kind, options);
  const segments = computeRuntimeSegments(def);

  return {
    kind,
    label: scenarioLabel(kind, options),
    segments,
    summary: summarizeRuntime(def, segments),
    warnings: collectWarnings(def),
  };
}

export function computeWhatIf(
  base: DiveDefinition,
  options: WhatIfOptions = DEFAULT_WHATIF_OPTIONS,
  kinds: readonly WhatIfKind[] = applicableKinds(base),
): WhatIfResult {
  const nominal = computeScenarioRuntime(base, 'NOMINAL', options);

  const scenarios = kinds
    .filter(kind => kind !== 'NOMINAL')
    .map(kind => {
      const runtime = computeScenarioRuntime(base, kind, options);
      return { ...runtime, delta: deltaFromNominal(nominal.summary, runtime.summary) };
    });

  return { nominal, scenarios };
}
