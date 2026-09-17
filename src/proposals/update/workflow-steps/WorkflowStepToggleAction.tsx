import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { CallWorkflowStep } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import {
  getEnabledStepIds,
  getMissingDependencies,
  stepDefinition,
  stepLabel,
} from '@/proposals/workflow/constants';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';
import { ActionItem } from '@/resource/actions/ActionItem';

import {
  disableCascadeConfirmation,
  getEnabledDependents,
  setStepEnabled,
} from './setStepEnabled';

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
  const enabledDependents = useMemo(
    () => (row.is_enabled ? getEnabledDependents(row, steps) : []),
    [steps, row],
  );

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
        ? disableCascadeConfirmation(row, enabledDependents)
        : undefined,
    [enabledDependents, row],
  );

  const toggleMutation = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      setStepEnabled({
        callUuid: call.uuid,
        row,
        steps,
        enabled: !row.is_enabled,
      }),
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
