import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const GroupEditDialog = lazyComponent(() =>
  import('./GroupFromDialog').then((module) => ({
    default: module.GroupFromDialog,
  })),
);

const groupEditDialog = (row, refetch) =>
  openModalDialog(GroupEditDialog, {
    resolve: { categoryGroup: row, refetch },
    size: 'lg',
  });

export const GroupEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(groupEditDialog(row, refetch)),
    [dispatch],
  );

  return <EditAction action={openFormDialog} size="sm" />;
};
