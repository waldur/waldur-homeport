import { TrashIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { stepDefinition } from '@/proposals/workflow/constants';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

interface OwnProps {
  row: CallWorkflowStep;
  call: Call;
  refetch(): void;
}

export const WorkflowStepDeleteAction = ({ row, call, refetch }: OwnProps) => {
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();
  const def = stepDefinition(row.step);

  const action = useCallback(async () => {
    try {
      await confirm(
        translate('Confirmation'),
        translate(
          'Are you sure you want to remove the {name} workflow step?',
          { name: <strong>{def?.name ?? row.step}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
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
      showErrorResponse(e, translate('Unable to remove workflow step.'));
    }
  }, [
    call.uuid,
    row.uuid,
    def?.name,
    row.step,
    confirm,
    showSuccess,
    showErrorResponse,
    queryClient,
    refetch,
  ]);

  if (def?.mandatory) return null;

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
