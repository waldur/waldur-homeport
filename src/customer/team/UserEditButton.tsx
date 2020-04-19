import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { getUser, getCustomer } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

interface UserEditButtonProps {
  editUser: User;
}

export const UserEditButton: React.FC<UserEditButtonProps> = ({ editUser }) => {
  const currentUser = useSelector(getUser);
  const currentCustomer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog('addTeamMember', {
        resolve: {
          currentCustomer,
          currentUser,
          editUser,
        },
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
