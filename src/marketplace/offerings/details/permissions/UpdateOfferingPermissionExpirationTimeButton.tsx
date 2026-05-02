import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

const UpdateOfferingPermissionExpirationTimeDialog = lazyComponent(() =>
  import('./UpdateOfferingPermissionExpirationTimeDialog').then((module) => ({
    default: module.UpdateOfferingPermissionExpirationTimeDialog,
  })),
);

export const UpdateOfferingPermissionExpirationTimeButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row: permission, refetch }) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const canUpdatePermission = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING_PERMISSION,
    customerId: customer.uuid,
  });

  const { openDialog } = useModal();
  const callback = () => {
    openDialog(UpdateOfferingPermissionExpirationTimeDialog, {
      resolve: { permission, refetch },
    });
  };
  return canUpdatePermission ? <EditAction action={callback} /> : null;
};
