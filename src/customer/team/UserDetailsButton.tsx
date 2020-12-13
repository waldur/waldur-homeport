import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { openUserPopover } from '@waldur/user/actions';
import { User } from '@waldur/workspace/types';

interface UserDetailsButtonProps {
  user: User;
}

export const UserDetailsButton: React.FC<UserDetailsButtonProps> = ({
  user,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openUserPopover({
        user_uuid: user.uuid,
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Details')}
      icon="fa fa-eye"
    />
  );
};
