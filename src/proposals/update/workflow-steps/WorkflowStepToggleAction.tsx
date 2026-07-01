import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import {
  getDependentSteps,
  getEnabledStepIds,
  getMissingDependencies,
  stepDefinition,
  stepLabel,
} from '@/proposals/workflow/constants';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';
import { ActionItem } from '@/resource/actions/ActionItem';

interface OwnProps {
  row: CallWorkflowStep;
  call: Call;
  // All configured steps for the call, needed to resolve dependencies and
  // dependents against the current enabled state.
  steps: CallWorkflowStep[];
  refetch(): void;
}

export const WorkflowStepToggleAction = ({
  row,
  call,
  steps,
  refetch,
}: OwnProps) => {
  const queryClient = useQueryClient();
  const def = stepDefinition(row.step);

  const enabledStepIds = useMemo(() => getEnabledStepIds(steps), [steps]);

  // Enabled steps that depend on this one. Disabling this step would strand
  // them (their dependency disappears), so we cascade the disable to them —
  // matching the backend rule that a dependent can't be enabled without its
  // dependency. Only relevant when this step is currently enabled.
  const enabledDependents = useMemo(() => {
    if (!row.is_enabled) return [];
    const dependentIds = new Set(getDependentSteps(row.step));
    return steps.filter((s) => s.is_enabled && dependentIds.has(s.step));
  }, [steps, row.step, row.is_enabled]);

  // When enabling, every dependency must already be enabled or the backend
  // rejects with a 400. Surface that as a disabled action with a hint instead.
  const missingDeps = useMemo(
    () =>
      row.is_enabled ? [] : getMissingDependencies(row.step, enabledStepIds),
    [row.is_enabled, row.step, enabledStepIds],
  );

  // Reconcile with the backend after every attempt — including a partial
  // cascade failure (one PATCH succeeding, a later one rejecting) — so the
  // table never shows a state that diverges from what the server stored. The
  // dashboard widget and the Activate-button gate read this React Query cache,
  // so the table refetch alone wouldn't keep them in sync.
  const reconcile = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: callWorkflowStepsKey(call.uuid),
    });
    refetch();
  }, [queryClient, call.uuid, refetch]);

  // Disabling a step silently turns off the steps that depend on it, so warn
  // first and let the user back out. Only present the confirmation when a
  // cascade would actually happen — a plain enable/disable stays a one-click
  // quick action.
  const confirmation = useMemo(
    () =>
      enabledDependents.length > 0
        ? {
            title: translate('Disable {step}?', { step: stepLabel(row.step) }),
            body: translate(
              '{dependents} depends on {step}, so it will be disabled too.',
              {
                dependents: (
                  <strong>
                    {enabledDependents.map((s) => stepLabel(s.step)).join(', ')}
                  </strong>
                ),
                step: stepLabel(row.step),
              },
              formatJsxTemplate,
            ),
            options: { positiveButton: translate('Disable') },
          }
        : undefined,
    [enabledDependents, row.step],
  );

  const toggleMutation = useManagedMutation<unknown, unknown, void>({
    mutationFn: async () => {
      // Disabling cascades to the dependents first, then this step (their
      // dependency); enabling touches only this step. Run the PATCHes
      // sequentially, NOT with Promise.all: concurrent requests race, and if
      // the backend evaluates the dependency's disable before the dependents'
      // it rejects with a 400 (a dependent can't stay enabled without its
      // dependency). Tearing the dependents down first keeps every
      // intermediate state valid.
      const targets = [...enabledDependents, row];
      for (const target of targets) {
        await proposalProtectedCallsWorkflowStepsPartialUpdate({
          path: { uuid: call.uuid, obj_uuid: target.uuid },
          body: { is_enabled: !row.is_enabled },
        });
      }
    },
    errorMessage: translate('Unable to update workflow step.'),
    // Row action, not a modal submission — nothing to close.
    closeModal: false,
    confirmation,
    onSuccess: reconcile,
    onError: reconcile,
  });

  const action = useCallback(
    () => toggleMutation.mutate(),
    [toggleMutation.mutate],
  );

  if (def?.mandatory) return null;

  const blocked = missingDeps.length > 0;

  return (
    <ActionItem
      title={row.is_enabled ? translate('Disable') : translate('Enable')}
      action={action}
      disabled={blocked}
      tooltip={
        blocked
          ? translate('Enable {steps} first.', {
              steps: missingDeps.map(stepLabel).join(', '),
            })
          : undefined
      }
    />
  );
};
