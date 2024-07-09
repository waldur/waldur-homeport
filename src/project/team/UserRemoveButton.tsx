import { Trash } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteProjectUser } from '@waldur/permissions/api';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { GenericPermission } from '@waldur/permissions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

interface UserRemoveButtonProps {
  permission: GenericPermission;
  refetch(): void;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  permission,
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const project = useSelector(getProject);
  const customer = useSelector(getCustomer);

  if (
    !hasPermission(user, {
      permission: PermissionEnum.DELETE_PROJECT_PERMISSION,
      customerId: customer.uuid,
      projectId: project.uuid,
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
          userName: permission.user_full_name || permission.user_username,
        }),
      );
    } catch {
      return;
    }

    try {
      await deleteProjectUser({
        project: project.uuid,
        user: permission.user_uuid,
        role: permission.role_name,
      });
      refetch();
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
