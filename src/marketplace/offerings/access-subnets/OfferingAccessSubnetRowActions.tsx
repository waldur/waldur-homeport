import { ActionsDropdown } from '@/table/ActionsDropdown';

import { OfferingAccessSubnetDeleteButton } from './OfferingAccessSubnetDeleteButton';
import { OfferingAccessSubnetEditButton } from './OfferingAccessSubnetEditButton';

export const OfferingAccessSubnetRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        OfferingAccessSubnetEditButton,
        OfferingAccessSubnetDeleteButton,
      ]}
    />
  );
};
