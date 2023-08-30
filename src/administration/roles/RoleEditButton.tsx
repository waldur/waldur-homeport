import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { editRole } from './api';

const RoleEditDialog = lazyComponent(
  () => import('./RoleEditDialog'),
  'RoleEditDialog',
);

export const RoleEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openRoleEditDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleEditDialog, {
          resolve: {
            row,
          },
          onSubmit: (formData) => {
            return editRole(row.uuid, formData).then(() => {
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
      title={translate('Edit role')}
      icon="fa fa-edit"
      action={openRoleEditDialog}
      variant="primary"
    />
  );
};
