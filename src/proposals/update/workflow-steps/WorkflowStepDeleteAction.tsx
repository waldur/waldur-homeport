import { TrashIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { stepName } from '@/proposals/workflow/constants';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

import { useConfirmPathChange } from './pathChangeImpact';

/**
 * The later steps that read the removed step as an input, said in a
 * sentence: removing the step takes it out of their input steps without a
 * further question. Null when no step reads it.
 */
export const inputReadersNotice = (
  row: CallWorkflowStep,
  steps: CallWorkflowStep[],
): string | null => {
  const names = steps
    .filter((s) => s.uuid !== row.uuid && s.input_steps?.includes(row.uuid))
    .map(stepName);
  if (!names.length) return null;
  if (names.length === 1) {
    return translate('{name} reads this step; it will lose it as an input.', {
      name: names[0],
    });
  }
  return translate(
    '{names} and {last} read this step; they will lose it as an input.',
    {
      names: names.slice(0, -1).join(', '),
      last: names[names.length - 1],
    },
  );
};

interface OwnProps {
  row: CallWorkflowStep;
  call: Call;
  // Every step of the call, in workflow order.
  steps?: CallWorkflowStep[];
  refetch(): void;
}

export const WorkflowStepDeleteAction = ({
  row,
  call,
  steps = [],
  refetch,
}: OwnProps) => {
  const confirmPathChange = useConfirmPathChange(call);
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();

  const readers = inputReadersNotice(row, steps);
  const action = useCallback(async () => {
    // One dialog: the removal question, and below it who keeps the step.
    const confirmed = await confirmPathChange(
      {
        kind: 'steps',
        before: steps,
        after: steps.filter((s) => s.uuid !== row.uuid),
        changedUuid: row.uuid,
      },
      {
        title: translate('Confirmation'),
        prompt: (
          <>
            <p className="mb-0">
              {translate(
                'Are you sure you want to remove the {name} workflow step?',
                { name: <strong>{stepName(row)}</strong> },
                formatJsxTemplate,
              )}
            </p>
            {readers && (
              <p className="mb-0 mt-1.5" data-testid="input-readers-notice">
                {readers}
              </p>
            )}
          </>
        ),
        forDeletion: true,
      },
    );
    if (!confirmed) return;
    try {
      await proposalProtectedCallsWorkflowStepsDestroy({
        path: { uuid: call.uuid, obj_uuid: row.uuid },
      });
      // The dashboard widget and the Activate-button gate read this React
      // Query cache; the table refetch alone wouldn't keep them in sync.
      queryClient.invalidateQueries({
        queryKey: callWorkflowStepsKey(call.uuid),
      });
      showSuccess(translate('Workflow step removed.'));
      refetch();
    } catch (e) {
      // A step proposals have already walked is refused; the backend says
      // to disable it instead, and that is the message worth showing.
      showErrorResponse(e, translate('Unable to remove workflow step.'));
    }
  }, [
    call.uuid,
    row,
    steps,
    readers,
    confirmPathChange,
    showSuccess,
    showErrorResponse,
    queryClient,
    refetch,
  ]);

  // The allocation decision cannot be removed.
  if (row.is_mandatory) return null;

  return (
    <ActionItem
      title={translate('Remove')}
      action={action}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
