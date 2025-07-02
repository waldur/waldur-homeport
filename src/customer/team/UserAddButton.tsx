import { UserPlusIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

interface UserAddButtonProps {
  refetch;
}

const AddUserDialog = lazyComponent(() =>
  import('@waldur/project/team/AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

export const UserAddButton: FunctionComponent<UserAddButtonProps> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

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
        dispatch(
          openModalDialog(AddUserDialog, {
            refetch,
            level: 'customer',
            title: translate('Add member'),
          }),
        )
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
