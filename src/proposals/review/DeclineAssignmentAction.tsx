import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { assignmentItemsDecline, MyAssignmentItem } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface DeclineAssignmentActionProps {
  item: MyAssignmentItem;
  batchUuid: string;
}

export const DeclineAssignmentAction: FC<DeclineAssignmentActionProps> = ({
  item,
  batchUuid,
}) => {
  // The confirmation resolves with the reason typed into it, which the call
  // manager reads on the batch: a conflict of interest is reported this way.
  const { mutate, isPending } = useManagedMutation<
    any,
    any,
    { input?: string } | void
  >({
    mutationFn: (result) =>
      assignmentItemsDecline({
        path: { uuid: item.uuid },
        body: {
          reason:
            (result && result.input?.trim()) || translate('User declined'),
        },
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
        showInput: true,
        inputLabel: translate('Reason'),
        inputPlaceholder: translate(
          'Optional, for example a conflict of interest',
        ),
        inputRequired: false,
      },
    },
  });

  return (
    <BaseButton
      onClick={() => mutate()}
      label={translate('Decline')}
      iconNode={<XIcon weight="bold" />}
      variant="danger"
      pending={isPending}
      size="sm"
    />
  );
};
