import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AccessSubnetDeleteButton } from './AccessSubnetDeleteButton';
import { AccessSubnetEditButton } from './AccessSubnetEditButton';

export const AccessSubnetRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[AccessSubnetEditButton, AccessSubnetDeleteButton]}
    />
  );
};
