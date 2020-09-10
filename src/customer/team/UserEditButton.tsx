import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser, getCustomer } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

import { EditTeamMemberDialog } from './EditTeamMemberDialog';

interface UserEditButtonProps {
  editUser: User;
}

export const UserEditButton: React.FC<UserEditButtonProps> = ({ editUser }) => {
  const currentUser = useSelector(getUser);
  const currentCustomer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(EditTeamMemberDialog, {
        resolve: {
          currentCustomer,
          currentUser,
          editUser,
        },
        size: 'lg',
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      icon="fa fa-pencil"
    />
  );
};
