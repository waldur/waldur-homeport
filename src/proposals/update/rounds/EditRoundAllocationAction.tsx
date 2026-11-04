import { ListChecksIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '@/proposals/workflow/queries';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditRoundAllocationDialog = lazyComponent(() =>
  import('@/proposals/round/allocation/EditRoundAllocationDialog').then(
    (m) => ({
      default: m.EditRoundAllocationDialog,
    }),
  ),
);

interface EditRoundAllocationActionProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
}

export const EditRoundAllocationAction: FC<EditRoundAllocationActionProps> = ({
  row,
  refetch,
  call,
}) => {
  const { openDialog } = useModal();
  // A round has an allocation date only when the call allocates on a fixed
  // date; otherwise the dialog would have nothing to edit.
  const { data: workflowSteps } = useQuery({
    queryKey: callWorkflowStepsKey(call.uuid),
    queryFn: () => fetchCallWorkflowSteps(call.uuid),
  });
  const hasDate =
    workflowSteps?.find((s) => s.step === 'allocation_decision')
      ?.allocation_time === 'fixed_date';

  const openEditAllocationDialog = useCallback(() => {
    openDialog(EditRoundAllocationDialog, {
      resolve: { round: row, call, refetch },
      size: 'lg',
    });
  }, [row, call, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Edit allocation settings')}
      action={openEditAllocationDialog}
      iconNode={<ListChecksIcon weight="bold" />}
      disabled={!hasDate}
      tooltip={
        hasDate
          ? undefined
          : translate(
              'This call allocates on decision — no allocation date is needed. Change the allocation timing on the Configuration tab to set a fixed date.',
            )
      }
    />
  );
};
