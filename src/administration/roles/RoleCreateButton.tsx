import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';

import { createRole, getRoles } from './api';

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
          onSubmit: async (formData) => {
            await createRole(formData);
            ENV.roles = await getRoles();
            dispatch(closeModalDialog());
            refetch();
          },
          onCancel: () => {
            dispatch(closeModalDialog());
          },
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openRoleCreateDialog} />;
};
