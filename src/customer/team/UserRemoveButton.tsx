import Axios from 'axios';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';

interface UserRemoveButtonProps {
  user: any;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({ user }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await Promise.all(
        user.projects.map(project => Axios.delete(project.permission)),
      );
      if (user.permission) {
        await Axios.delete(user.permission);
      }
      dispatch(showSuccess(translate('Team member has been removed.')));
    } catch (e) {
      dispatch(showError(translate('Unable to delete team member.')));
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
