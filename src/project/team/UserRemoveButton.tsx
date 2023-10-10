import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteProjectUser } from '@waldur/permissions/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getProject } from '@waldur/workspace/selectors';

interface UserRemoveButtonProps {
  permission;
  isDisabled: boolean;
  refetch(): void;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  permission,
  isDisabled,
  refetch,
}) => {
  const dispatch = useDispatch();
  const project = useSelector(getProject);
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
    <ActionButton
      disabled={isDisabled}
      tooltip={
        isDisabled
          ? translate(`You don't have permissions to delete this user.`)
          : ''
      }
      action={callback}
      title={translate('Remove')}
      icon="fa fa-trash"
    />
  );
};
