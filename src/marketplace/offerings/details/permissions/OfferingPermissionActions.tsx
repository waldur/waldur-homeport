import { OfferingPermissionRemoveButton } from '@waldur/marketplace/service-providers/OfferingPermissionRemoveButton';
import { UpdateOfferingPermissionExpirationTimeButton } from '@waldur/marketplace/service-providers/UpdateOfferingPermissionExpirationTimeButton';

export const OfferingPermissionActions = ({ row, fetch }) => {
  return (
    <>
      <OfferingPermissionRemoveButton permission={row} fetch={fetch} />
      <UpdateOfferingPermissionExpirationTimeButton
        permission={row}
        fetch={fetch}
      />
    </>
  );
};
