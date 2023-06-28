import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { OfferingPermissionRemoveButton } from '@waldur/marketplace/service-providers/OfferingPermissionRemoveButton';
import { UpdateOfferingPermissionExpirationTimeButton } from '@waldur/marketplace/service-providers/UpdateOfferingPermissionExpirationTimeButton';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

export const OfferingPermissionActions = ({ row }) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  if (isOwnerOrStaff) {
    return (
      <ButtonGroup>
        <OfferingPermissionRemoveButton permission={row} />
        <UpdateOfferingPermissionExpirationTimeButton permission={row} />
      </ButtonGroup>
    );
  } else {
    return null;
  }
};
