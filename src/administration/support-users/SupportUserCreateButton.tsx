import { useCallback } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const SupportUserFormDialog = lazyComponent(() =>
  import('./SupportUserFormDialog').then((module) => ({
    default: module.SupportUserFormDialog,
  })),
);

export const SupportUserCreateButton = ({ refetch }) => {
  const { openDialog } = useModal();
  const openCreateDialog = useCallback(
    () => openDialog(SupportUserFormDialog, { resolve: { refetch } }),
    [openDialog, refetch],
  );

  return <AddButton action={openCreateDialog} />;
};
