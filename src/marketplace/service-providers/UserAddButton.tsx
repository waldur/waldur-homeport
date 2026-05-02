import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

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
  const { openDialog } = useModal();
  const user = useUser();
  const customer = useSelector(getCustomer);
  const canAddUser = hasPermission(user, {
    permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
    customerId: customer.uuid,
  });
  return (
    <AddButton
      action={() =>
        openDialog(AddUserDialog, {
          refetch,
          level: 'service_provider',
          title: translate('Add member'),
        })
      }
      disabled={!canAddUser}
    />
  );
};
