import { UserPlusIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser, useCustomer } from '@/workspace/hooks';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@/workspace/selectors';

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

  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  const canAddUser =
    hasPermission(user, {
      permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      customerId: customer.uuid,
    });

  return (
    <ActionItem
      title={translate('Member')}
      action={() =>
        openDialog(AddUserDialog, {
          refetch,
          level: 'customer',
          title: translate('Add member'),
        })
      }
      iconNode={<UserPlusIcon weight="bold" />}
      disabled={!canAddUser || !isOwnerOrStaff}
      tooltip={
        !isOwnerOrStaff
          ? translate('Available for organization owner')
          : !canAddUser
            ? translate(
                "You don't have enough privileges to perform this operation.",
              )
            : null
      }
    />
  );
};
