import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

interface UserAddButtonProps {
  refetch;
}

const AddUserDialog = lazyComponent(
  () => import('@waldur/project/team/AddUserDialog'),
  'AddUserDialog',
);

export const UserAddButton: FunctionComponent<UserAddButtonProps> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
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
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(AddUserDialog, {
            refetch,
            level: 'organization',
            title: translate('Add member'),
          }),
        )
      }
      title={translate('Add member')}
      iconNode={<PlusCircle />}
      disabled={!canAddUser}
    />
  );
};
