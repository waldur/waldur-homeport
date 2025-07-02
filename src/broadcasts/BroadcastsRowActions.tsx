import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { BroadcastDeleteButton } from './BroadcastDeleteButton';
import { BroadcastSendButton } from './BroadcastSendButton';
import { BroadcastUpdateButton } from './BroadcastUpdateButton';

export const BroadcastsRowActions = ({ row, fetch }) => {
  if (row.state !== 'DRAFT' && row.state !== 'SCHEDULED') {
    return 'N/A';
  }
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        BroadcastUpdateButton,
        BroadcastSendButton,
        BroadcastDeleteButton,
      ].filter(Boolean)}
    />
  );
};
