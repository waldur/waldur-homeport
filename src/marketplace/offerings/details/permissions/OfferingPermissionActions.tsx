import { ButtonGroup } from 'react-bootstrap';

import { OfferingPermissionRemoveButton } from '@waldur/marketplace/service-providers/OfferingPermissionRemoveButton';
import { UpdateOfferingPermissionExpirationTimeButton } from '@waldur/marketplace/service-providers/UpdateOfferingPermissionExpirationTimeButton';

export const OfferingPermissionActions = ({ row, fetch }) => {
  return (
    <ButtonGroup>
      <OfferingPermissionRemoveButton permission={row} fetch={fetch} />
      <UpdateOfferingPermissionExpirationTimeButton
        permission={row}
        fetch={fetch}
      />
    </ButtonGroup>
  );
};
