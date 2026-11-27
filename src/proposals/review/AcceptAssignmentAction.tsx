import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { assignmentItemsAccept, MyAssignmentItem } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useArchivedCallReason } from '@/proposals/archivedCall';

interface AcceptAssignmentActionProps {
  item: MyAssignmentItem;
  batchUuid: string;
}

export const AcceptAssignmentAction: FC<AcceptAssignmentActionProps> = ({
  item,
  batchUuid,
}) => {
  // No review is taken on for an archived call.
  const archived = useArchivedCallReason();
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      assignmentItemsAccept({
        path: { uuid: item.uuid },
      }),
    successMessage: translate('Assignment accepted.'),
    errorMessage: translate('Unable to accept.'),
    invalidateQueries: [
      { queryKey: ['myAssignmentBatchDetail', batchUuid] },
      { queryKey: ['table', 'MyAssignmentBatchesTable'] },
    ],
  });

  return (
    <BaseButton
      onClick={mutate}
      label={translate('Accept')}
      iconNode={<CheckIcon weight="bold" />}
      variant="success"
      pending={isPending}
      disabled={Boolean(archived)}
      disabledReason={archived}
      size="sm"
    />
  );
};
