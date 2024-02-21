import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { GenericPermission } from '@waldur/permissions/types';
import { ProposalCall } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { deleteCallUser } from './api';

interface UserRemoveButtonProps {
  permission: GenericPermission;
  call: ProposalCall;
  refetch;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  permission,
  call,
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
      await deleteCallUser({
        call: call.uuid,
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
    <ActionButton
      action={callback}
      title={translate('Remove')}
      icon="fa fa-trash"
    />
  );
};
