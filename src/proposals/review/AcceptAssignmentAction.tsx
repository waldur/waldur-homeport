import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { assignmentItemsAccept, MyAssignmentItem } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CompactActionButton } from '@/table/CompactActionButton';

interface AcceptAssignmentActionProps {
  item: MyAssignmentItem;
  batchUuid: string;
}

export const AcceptAssignmentAction: FC<AcceptAssignmentActionProps> = ({
  item,
  batchUuid,
}) => {
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
    <CompactActionButton
      action={mutate}
      title={translate('Accept')}
      iconNode={<CheckIcon weight="bold" />}
      variant="success"
      pending={isPending}
    />
  );
};
