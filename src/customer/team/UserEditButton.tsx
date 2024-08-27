import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { NestedCustomerPermission } from './types';

const EditUserDialog = lazyComponent(
  () => import('./EditUserDialog'),
  'EditUserDialog',
);

interface UserEditButtonProps {
  customer: NestedCustomerPermission;
  refetch;
}

export const UserEditButton: React.FC<UserEditButtonProps> = ({
  customer,
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const currentCustomer = useSelector(getCustomer);
  const callback = () =>
    dispatch(
      openModalDialog(EditUserDialog, {
        resolve: {
          customer,
          refetch,
        },
      }),
    );
  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_CUSTOMER_PERMISSION,
      customerId: currentCustomer.uuid,
    })
  ) {
    return null;
  }
  return <EditButton onClick={callback} size="sm" />;
};
