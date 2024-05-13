import { PlusCircle } from '@phosphor-icons/react';
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

export const AddUserButton: React.FC<{ refetch }> = ({ refetch }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() => dispatch(openModalDialog(AddUserDialog, { refetch }))}
      title={translate('Add user')}
      iconNode={<PlusCircle />}
    />
  );
};
