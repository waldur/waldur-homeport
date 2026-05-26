import { SparkleIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalProtectedCallsGenerateAssignments } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

interface GenerateAssignmentsActionProps {
  call: Call;
  refetch: () => void;
}

export const GenerateAssignmentsAction = ({
  call,
  refetch,
}: GenerateAssignmentsActionProps) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();

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
    <ActionButton
      action={() => generateMutation.mutate()}
      title={translate('Generate assignments')}
      iconNode={<SparkleIcon weight="bold" />}
      variant="primary"
      pending={generateMutation.isPending}
    />
  );
};
