import { useCallback } from 'react';
import { rolesCreate } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { getRoles } from './utils';

const RoleFormDialog = lazyComponent(() =>
  import('./RoleFormDialog').then((module) => ({
    default: module.RoleFormDialog,
  })),
);

export const RoleCreateButton = ({ refetch }) => {
  const { openDialog, closeDialog } = useModal();
  const openRoleCreateDialog = useCallback(
    () =>
      openDialog(RoleFormDialog, {
        submitFn: async (formData) => {
          await rolesCreate({ body: formData });
          ENV.roles = await getRoles();
          closeDialog();
          refetch();
        },
      }),
    [refetch],
  );

  return <AddButton action={openRoleCreateDialog} />;
};
