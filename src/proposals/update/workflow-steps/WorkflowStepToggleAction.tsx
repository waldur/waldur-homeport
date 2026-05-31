import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
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

export const WorkflowStepToggleAction = ({ row, call, refetch }: OwnProps) => {
  const { showErrorResponse } = useNotify();
  const queryClient = useQueryClient();
  const def = stepDefinition(row.step);

  const action = useCallback(async () => {
    try {
      await proposalProtectedCallsWorkflowStepsPartialUpdate({
        path: { uuid: call.uuid, obj_uuid: row.uuid },
        body: { is_enabled: !row.is_enabled },
      });
      // The dashboard widget and the Activate-button gate read this React
      // Query cache; the table refetch alone wouldn't keep them in sync.
      queryClient.invalidateQueries({
        queryKey: callWorkflowStepsKey(call.uuid),
      });
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update workflow step.'));
    }
  }, [
    call.uuid,
    row.uuid,
    row.is_enabled,
    showErrorResponse,
    queryClient,
    refetch,
  ]);

  if (def?.mandatory) return null;

  return (
    <ActionItem
      title={row.is_enabled ? translate('Disable') : translate('Enable')}
      action={action}
    />
  );
};
