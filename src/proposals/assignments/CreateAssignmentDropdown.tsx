import { SparkleIcon, UserPlusIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { proposalProtectedCallsGenerateAssignments } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';

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
    <Menu>
      <Menu.TriggerButton variant="primary" size="lg">
        {translate('Create assignment')}
      </Menu.TriggerButton>
      <Menu.Content look="actions" side="bottom">
        <Menu.Item
          icon={<UserPlusIcon weight="bold" />}
          onSelect={handleManualAssignment}
        >
          {translate('Manual assignment')}
        </Menu.Item>
        <Menu.Item
          icon={<SparkleIcon weight="bold" />}
          onSelect={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {translate('Generate assignments')}
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
};
