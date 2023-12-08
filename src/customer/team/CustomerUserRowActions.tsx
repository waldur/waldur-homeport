import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { UserDetailsButton } from '@waldur/user/UserDetailsButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { UserEditButton } from './UserEditButton';
import { UserRemoveButton } from './UserRemoveButton';

interface CustomerUserRowActionsProps {
  refetch;
  row;
}

export const CustomerUserRowActions: FunctionComponent<CustomerUserRowActionsProps> =
  ({ row, refetch }) => {
    const user = useSelector(getUser);
    const customer = useSelector(getCustomer);
    const canSeeUserDetail =
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_CUSTOMER_PERMISSION,
        customerId: customer.uuid,
      }) || user.is_support;

    const canManageUser = hasPermission(user, {
      permission: PermissionEnum.UPDATE_CUSTOMER_PERMISSION,
      customerId: customer.uuid,
    });

    const canRemoveUser = hasPermission(user, {
      permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
      customerId: customer.uuid,
    });

    return canSeeUserDetail ? (
      <ButtonGroup>
        {canSeeUserDetail ? <UserDetailsButton userId={row.uuid} /> : null}
        {canManageUser ? <UserEditButton editUser={row} /> : null}
        {canRemoveUser ? (
          <UserRemoveButton user={row} refetch={refetch} />
        ) : null}
      </ButtonGroup>
    ) : null;
  };
