import { useCallback } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const RoleFormDialog = lazyComponent(() =>
  import('./RoleFormDialog').then((module) => ({
    default: module.RoleFormDialog,
  })),
);

export const RoleCreateButton = ({ refetch }) => {
  const { openDialog } = useModal();
  const openRoleCreateDialog = useCallback(
    () =>
      openDialog(RoleFormDialog, {
        resolve: { refetch },
        // 932px, the width the design specifies.
        dialogClassName: 'role-dialog',
      }),
    [openDialog, refetch],
  );

  return <AddButton action={openRoleCreateDialog} />;
};
