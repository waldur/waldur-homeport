import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { AssignmentBatchList, assignmentBatchesCancel } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface CancelActionProps {
  row: AssignmentBatchList;
  refetch: () => void;
}

export const CancelAction: FC<CancelActionProps> = ({ row, refetch }) => {
  const { mutate: handleCancel, isPending: isCancelling } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => assignmentBatchesCancel({ path: { uuid: row.uuid } }),
    successMessage: translate('Assignment batch cancelled.'),
    errorMessage: translate('Failed to cancel assignment batch.'),
    refetch,
    confirmation: {
      title: translate('Cancel assignment batch'),
      body: translate(
        'Are you sure you want to cancel this assignment batch for {reviewer}?',
        { reviewer: row.reviewer_name || row.reviewer_email },
      ),
    },
  });

  return (
    <ActionItem
      title={translate('Cancel')}
      action={() => handleCancel()}
      iconNode={<XIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      disabled={isCancelling}
    />
  );
};
