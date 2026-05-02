import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/actions';

import { RemoteSyncActionProps } from './types';

const RemoteSyncFormDialog = lazyComponent(() =>
  import('./RemoteSyncFormDialog').then((module) => ({
    default: module.RemoteSyncFormDialog,
  })),
);

export const RemoteSyncEditAction = ({
  row,
  refetch,
}: RemoteSyncActionProps) => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () =>
      openDialog(RemoteSyncFormDialog, {
        remoteSync: row,
        refetch,
        size: 'lg',
      }),
    [],
  );

  return <EditAction action={openFormDialog} />;
};
