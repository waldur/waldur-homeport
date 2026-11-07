import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';
import { ActionItem } from '@/resource/actions/ActionItem';

import { useConfirmPathChange } from './pathChangeImpact';

interface OwnProps {
  row: CallWorkflowStep;
  call: Call;
  // Every step of the call, in workflow order.
  steps?: CallWorkflowStep[];
  refetch(): void;
}

export const WorkflowStepToggleAction = ({
  row,
  call,
  steps = [],
  refetch,
}: OwnProps) => {
  const queryClient = useQueryClient();
  const confirmPathChange = useConfirmPathChange(call);

  // Reconcile with the backend after every attempt, so the table never shows
  // a state the server did not store. The dashboard widget and the
  // Activate-button gate read this React Query cache, so the table refetch
  // alone would not keep them in sync.
  const reconcile = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: callWorkflowStepsKey(call.uuid),
    });
    refetch();
  }, [queryClient, call.uuid, refetch]);

  const toggleMutation = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      proposalProtectedCallsWorkflowStepsPartialUpdate({
        path: { uuid: call.uuid, obj_uuid: row.uuid },
        body: { is_enabled: !row.is_enabled },
      }),
    errorMessage: translate('Unable to update workflow step.'),
    // Row action, not a modal submission -- nothing to close.
    closeModal: false,
    onSuccess: reconcile,
    onError: reconcile,
  });

  const action = useCallback(async () => {
    // Enabling or disabling a step changes the path of proposals submitted
    // from now on only.
    const confirmed = await confirmPathChange({
      kind: 'steps',
      before: steps,
      after: steps.map((s) =>
        s.uuid === row.uuid ? { ...s, is_enabled: !row.is_enabled } : s,
      ),
      changedUuid: row.uuid,
    });
    if (confirmed) toggleMutation.mutate();
  }, [toggleMutation.mutate, confirmPathChange, steps, row]);

  // The allocation decision always runs; the backend refuses to disable it.
  if (row.is_mandatory) return null;

  return (
    <ActionItem
      title={row.is_enabled ? translate('Disable') : translate('Enable')}
      action={action}
    />
  );
};
