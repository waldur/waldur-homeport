import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getCustomer, getUser } from '@/workspace/selectors';

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
    callOrganizerId: customer.call_managing_organization_uuid,
  });

  if (!canCreateCall) {
    return null;
  }
  const dispatch = useDispatch();

  return <AddButton action={() => dispatch(callCreateDialog(refetch))} />;
};
