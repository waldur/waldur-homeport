import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { AccessSubnetDeleteButton } from './AccessSubnetDeleteButton';
import { AccessSubnetEditButton } from './AccessSubnetEditButton';
import { AccessSubnetImpactActionItem } from './AccessSubnetImpactActionItem';

export const AccessSubnetRowActions = ({ row, refetch, customerUuid }) => {
  const user = useUser();
  // An entry staff pinned cannot be edited or removed by anyone else, whatever
  // its width — but they can still ask what it reaches, since the impact view
  // only reads. Staff keep the full set.
  const readOnly = row.is_staff_managed && !user.is_staff;
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      // Spread into each action: the edit dialog needs the organization to
      // resolve which offerings the entry may be scoped to.
      data={{ customer_uuid: customerUuid }}
      actions={
        readOnly
          ? [AccessSubnetImpactActionItem]
          : [
              AccessSubnetImpactActionItem,
              AccessSubnetEditButton,
              AccessSubnetDeleteButton,
            ]
      }
    />
  );
};
