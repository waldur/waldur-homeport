import { EyeIcon } from '@phosphor-icons/react';
import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const UserPopover = lazyComponent(() =>
  import('@/user/UserPopover').then((module) => ({
    default: module.UserPopover,
  })),
);

interface UserDetailsButtonProps {
  userId: string;
}

export const UserDetailsButton: React.FC<UserDetailsButtonProps> = ({
  userId,
}) => {
  const { openDialog } = useModal();

  const callback = () =>
    openDialog(UserPopover, {
      resolve: { user_uuid: userId },
      size: 'lg',
    });
  return (
    <ActionItem
      title={translate('Details')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
      staff
    />
  );
};
