import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { createRole } from './api';

const RoleCreateDialog = lazyComponent(
  () => import('./RoleCreateDialog'),
  'RoleCreateDialog',
);

export const RoleCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openRoleCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleCreateDialog, {
          onSubmit: (formData) => {
            return createRole(formData).then(() => {
              dispatch(closeModalDialog());
              refetch();
            });
          },
          onCancel: () => {
            dispatch(closeModalDialog());
          },
        }),
      ),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('New role')}
      icon="fa fa-plus"
      action={openRoleCreateDialog}
      variant="primary"
    />
  );
};
