import { Trash } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteCustomerUser, deleteProjectUser } from '@waldur/permissions/api';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { NestedCustomerPermission } from './types';

interface UserRemoveButtonProps {
  customer: NestedCustomerPermission;
  refetch;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  customer,
  refetch,
}) => {
  const currentUser = useSelector(getUser);
  const currentCustomer = useSelector(getCustomer);
  const dispatch = useDispatch();
  if (
    !hasPermission(currentUser, {
      permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
      customerId: currentCustomer.uuid,
    })
  ) {
    return null;
  }

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to remove {userName}?', {
          userName: customer.full_name || customer.username,
        }),
      );
    } catch {
      return;
    }
    try {
      await Promise.all(
        customer.projects.map((project) =>
          deleteProjectUser({
            project: project.uuid,
            user: customer.uuid,
            role: project.role_name,
          }),
        ),
      );
      if (customer.role_name) {
        await deleteCustomerUser({
          customer: currentCustomer.uuid,
          user: customer.uuid,
          role: customer.role_name,
        });
      }
      await refetch();
      dispatch(showSuccess(translate('Team member has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete team member.')),
      );
    }
  };
  return (
    <RowActionButton
      action={callback}
      title={translate('Remove')}
      iconNode={<Trash />}
      size="sm"
    />
  );
};
