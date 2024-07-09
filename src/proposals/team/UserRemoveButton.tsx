import { Trash } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { GenericPermission } from '@waldur/permissions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

import { deleteScopeUser } from './api';

interface UserRemoveButtonProps {
  permission: GenericPermission;
  scope: { url: string };
  refetch;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  permission,
  scope,
  refetch,
}) => {
  const dispatch = useDispatch();

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
      await deleteScopeUser({
        scope: scope.url,
        user: permission.user_uuid,
        role: permission.role_name,
      });
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
