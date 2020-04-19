import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';
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
      openModalDialog('userPopover', {
        resolve: {
          user_uuid: user.uuid,
        },
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
