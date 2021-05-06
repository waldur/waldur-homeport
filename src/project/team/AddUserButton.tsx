import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const AddProjectUserDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AddProjectUserDialog" */ './AddProjectUserDialog'
    ),
  'AddProjectUserDialog',
);

export const AddUserButton: React.FC<{ refreshList }> = ({ refreshList }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(openModalDialog(AddProjectUserDialog, { refreshList }))
      }
      title={translate('Add user')}
      icon="fa fa-plus"
    />
  );
};
