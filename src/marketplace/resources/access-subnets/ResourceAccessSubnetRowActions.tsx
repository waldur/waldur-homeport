import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ResourceAccessSubnetDeleteButton } from './ResourceAccessSubnetDeleteButton';
import { ResourceAccessSubnetEditButton } from './ResourceAccessSubnetEditButton';

export const ResourceAccessSubnetRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        ResourceAccessSubnetEditButton,
        ResourceAccessSubnetDeleteButton,
      ]}
    />
  );
};
