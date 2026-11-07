import { FC } from 'react';
import { ConflictOfInterest } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { COIDismissAction } from './COIDismissAction';
import { COIRecuseAction } from './COIRecuseAction';
import { COIWaiveAction } from './COIWaiveAction';

interface COIRowActionsProps {
  row: ConflictOfInterest;
  fetch: () => void;
  /** The call's types requiring recusal: such a conflict is not waived. */
  recusalTypes?: string[];
}

export const COIRowActions: FC<COIRowActionsProps> = ({
  row,
  fetch,
  recusalTypes,
}) => {
  // Don't show actions if already reviewed (not pending)
  if (row.status !== 'pending') {
    return null;
  }

  return (
    <ActionsMenu>
      <COIDismissAction row={row} fetch={fetch} />
      <COIWaiveAction
        row={row}
        fetch={fetch}
        disabledReason={
          recusalTypes?.includes(row.coi_type)
            ? translate(
                'This call requires recusal for this type of conflict: it cannot be waived with a management plan.',
              )
            : undefined
        }
      />
      <COIRecuseAction row={row} fetch={fetch} />
    </ActionsMenu>
  );
};
