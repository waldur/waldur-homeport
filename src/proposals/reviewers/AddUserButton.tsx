import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { AddUserDialogProps } from './types';

const AddUserDialog = lazyComponent(
  () => import('./AddUserDialog'),
  'AddUserDialog',
);

export const AddUserButton: React.FC<AddUserDialogProps> = (props) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() => dispatch(openModalDialog(AddUserDialog, props))}
      title={translate('Add user')}
      icon="fa fa-plus"
    />
  );
};
