import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { assignmentItemsDecline, MyAssignmentItem } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CompactActionButton } from '@/table/CompactActionButton';

interface DeclineAssignmentActionProps {
  item: MyAssignmentItem;
  batchUuid: string;
}

export const DeclineAssignmentAction: FC<DeclineAssignmentActionProps> = ({
  item,
  batchUuid,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      assignmentItemsDecline({
        path: { uuid: item.uuid },
        body: { reason: translate('User declined') },
      }),
    successMessage: translate('Assignment declined.'),
    errorMessage: translate('Unable to decline.'),
    invalidateQueries: [
      { queryKey: ['myAssignmentBatchDetail', batchUuid] },
      { queryKey: ['table', 'MyAssignmentBatchesTable'] },
    ],
    confirmation: {
      title: translate('Decline assignment'),
      body: translate(
        'Are you sure you want to decline reviewing this proposal: {proposal}?',
        { proposal: item.proposal_name },
      ),
      options: {
        positiveButton: translate('Decline'),
        positiveButtonVariant: 'danger',
      },
    },
  });

  return (
    <CompactActionButton
      action={mutate}
      title={translate('Decline')}
      iconNode={<XIcon weight="bold" />}
      variant="outline-danger"
      pending={isPending}
    />
  );
};
