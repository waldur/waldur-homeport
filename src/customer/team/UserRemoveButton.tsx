import { TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  customersDeleteUser,
  CustomerUser,
  projectsDeleteUser,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

interface UserRemoveButtonProps {
  customer: CustomerUser;
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
          projectsDeleteUser({
            path: { uuid: project.uuid },
            body: {
              user: customer.uuid,
              role: project.role_name,
            },
          }),
        ),
      );
      if (customer.role_name) {
        await customersDeleteUser({
          path: { uuid: currentCustomer.uuid },
          body: {
            user: customer.uuid,
            role: customer.role_name,
          },
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
    <ActionItem
      className="text-danger border-top"
      iconColor="danger"
      title={translate('Remove')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
