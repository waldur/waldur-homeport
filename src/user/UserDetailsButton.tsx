import { EyeIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { openUserPopover } from '@waldur/user/actions';

interface UserDetailsButtonProps {
  userId: string;
}

export const UserDetailsButton: React.FC<UserDetailsButtonProps> = ({
  userId,
}) => {
  const dispatch = useDispatch();

  const callback = () =>
    dispatch(
      openUserPopover({
        user_uuid: userId,
      }),
    );
  return (
    <ActionItem
      title={translate('Details')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
