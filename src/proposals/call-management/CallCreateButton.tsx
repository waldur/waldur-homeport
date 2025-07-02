import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const CallCreateDialog = lazyComponent(() =>
  import('./CallFormDialog').then((module) => ({
    default: module.CallFormDialog,
  })),
);

const callCreateDialog = (refetch) =>
  openModalDialog(CallCreateDialog, {
    resolve: { refetch },
    size: 'lg',
  });

export const CallCreateButton = ({ refetch }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const canCreateCall = hasPermission(user, {
    permission: PermissionEnum.CREATE_CALL,
    customerId: customer.uuid,
  });

  if (!canCreateCall) {
    return null;
  }
  const dispatch = useDispatch();

  return <AddButton action={() => dispatch(callCreateDialog(refetch))} />;
};
