import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { rolesCreate } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { closeModalDialog, openModalDialog } from '@/modal/actions';

import { getRoles } from './utils';

const RoleFormDialog = lazyComponent(() =>
  import('./RoleFormDialog').then((module) => ({
    default: module.RoleFormDialog,
  })),
);

export const RoleCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openRoleCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleFormDialog, {
          submitFn: async (formData) => {
            await rolesCreate({ body: formData });
            ENV.roles = await getRoles();
            dispatch(closeModalDialog());
            refetch();
          },
        }),
      ),
    [dispatch, refetch],
  );

  return <AddButton action={openRoleCreateDialog} />;
};
