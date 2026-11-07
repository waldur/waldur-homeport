import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';
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

import { swapWithNeighbour, useConfirmPathChange } from './pathChangeImpact';

/**
 * The `order` that moves `row` one place up or down among `steps` (sorted by
 * order). The backend makes room at the requested position: the step there,
 * and every step after it, moves one down. So moving up takes the previous
 * step's position, and moving down takes the one right after the next step.
 * Undefined when the step is already first or last.
 */
export const getMoveTarget = (
  row: Pick<CallWorkflowStep, 'uuid'>,
  steps: Pick<CallWorkflowStep, 'uuid' | 'order'>[],
  direction: 'up' | 'down',
): number | undefined => {
  const index = steps.findIndex((s) => s.uuid === row.uuid);
  if (index === -1) return undefined;
  if (direction === 'up') {
    const previous = steps[index - 1];
    return previous?.order;
  }
  const next = steps[index + 1];
  return next?.order != null ? next.order + 1 : undefined;
};

interface OwnProps {
  row: CallWorkflowStep;
  call: Call;
  // Every step of the call, in workflow order.
  steps: CallWorkflowStep[];
  direction: 'up' | 'down';
  refetch(): void;
}

export const WorkflowStepMoveAction = ({
  row,
  call,
  steps,
  direction,
  refetch,
}: OwnProps) => {
  const queryClient = useQueryClient();
  const confirmPathChange = useConfirmPathChange(call);
  const target = getMoveTarget(row, steps, direction);

  const reconcile = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: callWorkflowStepsKey(call.uuid),
    });
    refetch();
  }, [queryClient, call.uuid, refetch]);

  const moveMutation = useManagedMutation<unknown, unknown, number>({
    mutationFn: (order) =>
      proposalProtectedCallsWorkflowStepsPartialUpdate({
        path: { uuid: call.uuid, obj_uuid: row.uuid },
        body: { order },
      }),
    errorMessage: translate('Unable to move workflow step.'),
    closeModal: false,
    onSuccess: reconcile,
    onError: reconcile,
  });

  const action = useCallback(async () => {
    if (target === undefined) return;
    // Proposals already submitted keep the order they were submitted with;
    // the manager sees who is affected before the order changes under them.
    const confirmed = await confirmPathChange({
      kind: 'order',
      before: steps,
      after: swapWithNeighbour(steps, row.uuid, direction),
      changedUuid: row.uuid,
    });
    if (confirmed) moveMutation.mutate(target);
  }, [
    moveMutation.mutate,
    target,
    confirmPathChange,
    steps,
    row.uuid,
    direction,
  ]);

  return (
    <ActionItem
      title={direction === 'up' ? translate('Move up') : translate('Move down')}
      action={action}
      iconNode={
        direction === 'up' ? (
          <ArrowUpIcon weight="bold" />
        ) : (
          <ArrowDownIcon weight="bold" />
        )
      }
      disabled={target === undefined}
      tooltip={
        target === undefined
          ? direction === 'up'
            ? translate('This is the first step.')
            : translate('This is the last step.')
          : undefined
      }
    />
  );
};
