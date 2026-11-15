/**
 * DecoPlan – WhatIf : point d'entrée
 *
 *   const result = computeWhatIf(definition);
 *   result.nominal            → runtime de référence
 *   result.scenarios[i].delta → écart avec le nominal
 */

import { computeBailoutScenario } from './bailoutScenario';
import { computeRuntimeSegments } from './runtime';
import { applicableKinds, applyScenario, DEFAULT_WHATIF_OPTIONS, scenarioLabel } from './scenarios';
import { deltaFromNominal, summarizeRuntime } from './summary';
import type {
  DiveDefinition, WhatIfKind, WhatIfOptions, WhatIfResult, WhatIfRuntime, WhatIfUnavailable,
} from './types';
import { collectWarnings } from './warnings';

/** Calcule le runtime d'un seul scénario (sans écart : voir computeWhatIf). */
export function computeScenarioRuntime(
  base: DiveDefinition,
  kind: WhatIfKind,
  options: WhatIfOptions = DEFAULT_WHATIF_OPTIONS,
): WhatIfRuntime {
  const def = applyScenario(base, kind, options);
  const bailout = kind === 'BAILOUT' ? computeBailoutScenario(def) : undefined;
  const segments = bailout ? bailout.segments : computeRuntimeSegments(def);

  return {
    kind,
    label: scenarioLabel(kind, options),
    segments,
    summary: summarizeRuntime(def, segments),
    warnings: collectWarnings(def),
    ...(bailout ? { gasUsage: bailout.gasUsage } : {}),
  };
}

export function computeWhatIf(
  base: DiveDefinition,
  options: WhatIfOptions = DEFAULT_WHATIF_OPTIONS,
  kinds: readonly WhatIfKind[] = applicableKinds(base),
): WhatIfResult {
  const nominal = computeScenarioRuntime(base, 'NOMINAL', options);

  const scenarios: WhatIfRuntime[] = [];
  const unavailable: WhatIfUnavailable[] = [];

  for (const kind of kinds.filter(k => k !== 'NOMINAL')) {
    try {
      const runtime = computeScenarioRuntime(base, kind, options);
      scenarios.push({ ...runtime, delta: deltaFromNominal(nominal.summary, runtime.summary) });
    } catch (error) {
      // Seul le bail-out peut échouer « normalement » (aucun gaz respirable) ; les autres erreurs remontent.
      if (kind !== 'BAILOUT') throw error;
      unavailable.push({
        kind,
        label: scenarioLabel(kind, options),
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { nominal, scenarios, unavailable };
}
