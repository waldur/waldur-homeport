import { UserPlusIcon } from '@phosphor-icons/react';
import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { AddUserDialogProps } from './types';

const AddUserDialog = lazyComponent(() =>
  import('./AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

export const AddUserButton: React.FC<AddUserDialogProps> = (props) => {
  const { openDialog } = useModal();
  const user = useUser();
  return (
    user.is_staff && (
      <ActionItem
        title={translate('Member')}
        action={() => openDialog(AddUserDialog, props)}
        iconNode={<UserPlusIcon weight="bold" />}
      />
    )
  );
};
