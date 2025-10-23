import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { OfferingPermissionRemoveButton } from './OfferingPermissionRemoveButton';
import { UpdateOfferingPermissionExpirationTimeButton } from './UpdateOfferingPermissionExpirationTimeButton';

export const OfferingPermissionActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        UpdateOfferingPermissionExpirationTimeButton,
        OfferingPermissionRemoveButton,
      ]}
    />
  );
};
