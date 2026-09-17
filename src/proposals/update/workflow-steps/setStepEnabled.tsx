import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { getDependentSteps, stepLabel } from '@/proposals/workflow/constants';

/**
 * Enabled steps that depend on `row`, directly or transitively.
 *
 * Disabling `row` would strand them — the backend rejects *enabling* a step
 * whose dependency is off, so leaving a dependent on without its dependency
 * produces a workflow that can no longer be saved. Both entry points (the row
 * action and the config dialog's switch) warn and then cascade through here.
 */
export const getEnabledDependents = (
  row: Pick<CallWorkflowStep, 'step'>,
  steps: CallWorkflowStep[],
): CallWorkflowStep[] => {
  const dependentIds = new Set(getDependentSteps(row.step));
  return steps.filter((s) => s.is_enabled && dependentIds.has(s.step));
};

/**
 * The warning shown before a disable takes its dependents down with it.
 *
 * Shared so the row action and the config dialog ask the same question --
 * either entry point turns the same set of steps off.
 */
export const disableCascadeConfirmation = (
  row: Pick<CallWorkflowStep, 'step'>,
  dependents: CallWorkflowStep[],
) => ({
  title: translate('Disable {step}?', { step: stepLabel(row.step) }),
  body: translate(
    '{dependents} depends on {step}, so it will be disabled too.',
    {
      dependents: (
        <strong>{dependents.map((s) => stepLabel(s.step)).join(', ')}</strong>
      ),
      step: stepLabel(row.step),
    },
    formatJsxTemplate,
  ),
  options: { positiveButton: translate('Disable') },
});

/**
 * Turn off every enabled step that depends on `row`, leaving `row` itself
 * alone. Callers that patch `row` in the same breath (the config dialog sends
 * it alongside the rest of the form) run this first, so no intermediate state
 * has a dependent outliving its dependency.
 */
export const disableDependents = async (
  callUuid: string,
  row: CallWorkflowStep,
  steps: CallWorkflowStep[],
) => {
  for (const target of getEnabledDependents(row, steps)) {
    await proposalProtectedCallsWorkflowStepsPartialUpdate({
      path: { uuid: callUuid, obj_uuid: target.uuid },
      body: { is_enabled: false },
    });
  }
};

interface SetStepEnabledParams {
  callUuid: string;
  row: CallWorkflowStep;
  steps: CallWorkflowStep[];
  enabled: boolean;
}

/**
 * Flip `is_enabled` on a step, cascading a disable to its enabled dependents.
 *
 * The PATCHes run sequentially, NOT with Promise.all: the dependents go off
 * first so that no intermediate state -- including the one a failure midway
 * leaves behind -- has a dependent enabled without its dependency. The
 * backend would accept either order (it checks dependencies only when a step
 * is enabled), so nothing but this ordering keeps that state out.
 */
export const setStepEnabled = async ({
  callUuid,
  row,
  steps,
  enabled,
}: SetStepEnabledParams) => {
  if (!enabled) {
    await disableDependents(callUuid, row, steps);
  }
  await proposalProtectedCallsWorkflowStepsPartialUpdate({
    path: { uuid: callUuid, obj_uuid: row.uuid },
    body: { is_enabled: enabled },
  });
};
