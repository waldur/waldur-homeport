import { FC } from 'react';
import { AssignmentBatchList } from 'waldur-js-client';

import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { CancelAction } from './CancelAction';
import { ExtendDeadlineAction } from './ExtendDeadlineAction';
import { SendAction } from './SendAction';

interface AssignmentBatchRowActionsProps {
  row: AssignmentBatchList;
  refetch: () => void;
}

export const AssignmentBatchRowActions: FC<AssignmentBatchRowActionsProps> = ({
  row,
  refetch,
}) => {
  const canSend = row.status === 'draft';
  const canCancel = row.status === 'draft' || row.status === 'sent';
  const canExtendDeadline = row.status === 'sent' || row.status === 'expired';

  if (!canSend && !canCancel && !canExtendDeadline) {
    return null;
  }

  return (
    <ActionsDropdownComponent>
      {canSend && <SendAction row={row} refetch={refetch} />}
      {canExtendDeadline && (
        <ExtendDeadlineAction row={row} refetch={refetch} />
      )}
      {canCancel && <CancelAction row={row} refetch={refetch} />}
    </ActionsDropdownComponent>
  );
};
