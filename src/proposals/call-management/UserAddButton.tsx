import { FunctionComponent } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';

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
  const customer = useCustomer();
  const canAddUser = hasPermission(user, {
    permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
    customerId: customer.uuid,
  });
  return (
    <AddButton
      action={() =>
        openDialog(AddUserDialog, {
          refetch,
          level: 'call_organizer',
          title: translate('Add member'),
        })
      }
      disabled={!canAddUser}
    />
  );
};
