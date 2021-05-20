import Axios from 'axios';
import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface UserRemoveButtonProps {
  user: any;
  refreshList;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  user,
  refreshList,
}) => {
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
        user.projects.map((project) => Axios.delete(project.permission)),
      );
      if (user.permission) {
        await Axios.delete(user.permission);
      }
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
      action={callback}
      title={translate('Remove')}
      icon="fa fa-trash"
    />
  );
};
