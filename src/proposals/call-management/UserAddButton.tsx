import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getCustomer, getUser } from '@/workspace/selectors';

interface UserAddButtonProps {
  refetch;
}

const AddUserDialog = lazyComponent(() =>
  import('@/project/team/AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

export const UserAddButton: FunctionComponent<UserAddButtonProps> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const canAddUser = hasPermission(user, {
    permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
    customerId: customer.uuid,
  });
  return (
    <AddButton
      action={() =>
        dispatch(
          openModalDialog(AddUserDialog, {
            refetch,
            level: 'call_organizer',
            title: translate('Add member'),
          }),
        )
      }
      disabled={!canAddUser}
    />
  );
};
