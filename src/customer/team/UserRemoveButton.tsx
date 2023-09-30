import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteCustomerUser, deleteProjectUser } from '@waldur/permissions/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer } from '@waldur/workspace/selectors';

interface UserRemoveButtonProps {
  user: any;
  refetch;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  user,
  refetch,
}) => {
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to remove {userName}?', {
          userName: user.full_name || user.username,
        }),
      );
    } catch {
      return;
    }
    try {
      await Promise.all(
        user.projects.map((project) =>
          deleteProjectUser({
            project: project.uuid,
            user: user.uuid,
            role: project.role_name,
          }),
        ),
      );
      if (user.permission) {
        await deleteCustomerUser({
          customer: customer.uuid,
          user: user.uuid,
          role: user.role_name,
        });
      }
      refetch();
      dispatch(showSuccess(translate('Team member has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete team member.')),
      );
    }
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Remove')}
      icon="fa fa-trash"
    />
  );
};
