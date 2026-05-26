import { FC } from 'react';
import { ConflictOfInterest } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

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
    <ActionsDropdownComponent title={translate('Actions')}>
      <COIDismissAction row={row} fetch={fetch} />
      <COIWaiveAction row={row} fetch={fetch} />
      <COIRecuseAction row={row} fetch={fetch} />
    </ActionsDropdownComponent>
  );
};
