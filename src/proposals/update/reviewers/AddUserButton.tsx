import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const AddUserDialog = lazyComponent(
  () => import('./AddUserDialog'),
  'AddUserDialog',
);

export const AddUserButton: React.FC<{ refetch; call }> = ({
  refetch,
  call,
}) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() => dispatch(openModalDialog(AddUserDialog, { refetch, call }))}
      title={translate('Add user')}
      icon="fa fa-plus"
    />
  );
};
