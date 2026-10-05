import { FC } from 'react';
import { ConflictOfInterest } from 'waldur-js-client';

import { ActionsMenu } from '@/table/ActionsDropdown';

import { COIDismissAction } from './COIDismissAction';
import { COIRecuseAction } from './COIRecuseAction';
import { COIWaiveAction } from './COIWaiveAction';

interface COIRowActionsProps {
  row: ConflictOfInterest;
  fetch: () => void;
}

export const COIRowActions: FC<COIRowActionsProps> = ({ row, fetch }) => {
  // Don't show actions if already reviewed (not pending)
  if (row.status !== 'pending') {
    return null;
  }

  return (
    <ActionsMenu>
      <COIDismissAction row={row} fetch={fetch} />
      <COIWaiveAction row={row} fetch={fetch} />
      <COIRecuseAction row={row} fetch={fetch} />
    </ActionsMenu>
  );
};
