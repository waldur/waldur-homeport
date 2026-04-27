import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { openModalDialog } from '@/modal/actions';

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
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RemoteSyncFormDialog, {
          remoteSync: row,
          refetch,
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <EditAction action={openFormDialog} />;
};
