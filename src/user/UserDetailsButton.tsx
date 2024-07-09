import { Eye } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RowActionButton } from '@waldur/table/ActionButton';
import { openUserPopover } from '@waldur/user/actions';
import { getUser } from '@waldur/workspace/selectors';

interface UserDetailsButtonProps {
  userId: string;
}

export const UserDetailsButton: React.FC<UserDetailsButtonProps> = ({
  userId,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (!user.is_staff && !user.is_support) {
    return null;
  }
  const callback = () =>
    dispatch(
      openUserPopover({
        user_uuid: userId,
      }),
    );
  return (
    <RowActionButton
      action={callback}
      title={translate('Details')}
      iconNode={<Eye />}
      size="sm"
    />
  );
};
