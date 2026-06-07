import { SparkleIcon, UserPlusIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { proposalProtectedCallsGenerateAssignments } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';

const CreateManualAssignmentDialog = lazyComponent(() =>
  import('./CreateManualAssignmentDialog').then((module) => ({
    default: module.CreateManualAssignmentDialog,
  })),
);

interface CreateAssignmentDropdownProps {
  call: Call;
  refetch: () => void;
}

export const CreateAssignmentDropdown: FC<CreateAssignmentDropdownProps> = ({
  call,
  refetch,
}) => {
  const { openDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();

  const handleManualAssignment = useCallback(() => {
    openDialog(CreateManualAssignmentDialog, {
      resolve: { call, refetch },
    });
  }, [call, refetch, openDialog]);

  const generateMutation = useMutation({
    mutationFn: () =>
      proposalProtectedCallsGenerateAssignments({
        path: { uuid: call.uuid },
      }),
    onSuccess: (response) => {
      const data = response.data;
      showSuccess(
        translate(
          'Generated {batches} batches with {items} assignment items for {proposals} proposals.',
          {
            batches: data.batches_created,
            items: data.items_created,
            proposals: data.proposals_processed,
          },
        ),
      );
      refetch();
      queryClient.invalidateQueries({ queryKey: ['AssignmentBatchesTable'] });
    },
    onError: (error) => {
      showErrorResponse(error, translate('Failed to generate assignments.'));
    },
  });

  return (
    <ActionDropdownButton
      title={translate('Create assignment')}
      variant="primary"
    >
      <ActionItem
        title={translate('Manual assignment')}
        action={handleManualAssignment}
        iconNode={<UserPlusIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Generate assignments')}
        action={() => generateMutation.mutate()}
        iconNode={<SparkleIcon weight="bold" />}
        disabled={generateMutation.isPending}
      />
    </ActionDropdownButton>
  );
};
