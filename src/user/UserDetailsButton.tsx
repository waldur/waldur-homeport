import { EyeIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { RowActionButton } from '@waldur/table/ActionButton';
import { openUserPopover } from '@waldur/user/actions';

interface UserDetailsButtonProps {
  userId: string;
  asDropdownItem?: boolean;
}

export const UserDetailsButton: React.FC<UserDetailsButtonProps> = ({
  userId,
  asDropdownItem,
}) => {
  const dispatch = useDispatch();

  const callback = () =>
    dispatch(
      openUserPopover({
        user_uuid: userId,
      }),
    );
  return asDropdownItem ? (
    <ActionItem
      title={translate('Details')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  ) : (
    <RowActionButton
      action={callback}
      title={translate('Details')}
      iconNode={<EyeIcon weight="bold" />}
      size="sm"
    />
  );
};
