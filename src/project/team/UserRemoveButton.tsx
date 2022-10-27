import Axios from 'axios';
import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface UserRemoveButtonProps {
  permission: string;
  isDisabled: boolean;
  refreshList(): void;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  permission,
  isDisabled,
  refreshList,
}) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await Axios.delete(permission);
      refreshList();
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
