import { UserPlusIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getUser } from '@waldur/workspace/selectors';

import { AddUserDialogProps } from './types';

const AddUserDialog = lazyComponent(() =>
  import('./AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

export const AddUserButton: React.FC<AddUserDialogProps> = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  return (
    user.is_staff && (
      <ActionItem
        title={translate('Member')}
        action={() => dispatch(openModalDialog(AddUserDialog, props))}
        iconNode={<UserPlusIcon weight="bold" />}
      />
    )
  );
};
