import Axios from 'axios';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';

interface UserRemoveButtonProps {
  user: any;
  isProjectManager: boolean;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  user,
  isProjectManager,
}) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await Axios.delete(user.permission);
      dispatch(showSuccess(translate('Team member has been removed.')));
    } catch (e) {
      dispatch(showError(translate('Unable to delete team member.')));
    }
  };
  return (
    <ActionButton
      disabled={isProjectManager && user.role === 'manager'}
      tooltip={
        isProjectManager && user.role === 'manager'
          ? translate('Project manager cannot edit users with same role.')
          : ''
      }
      action={callback}
      title={translate('Remove')}
      icon="fa fa-trash"
    />
  );
};
