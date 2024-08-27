import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const GroupEditDialog = lazyComponent(
  () => import('./GroupFromDialog'),
  'GroupFromDialog',
);

const groupEditDialog = (row, refetch) =>
  openModalDialog(GroupEditDialog, {
    resolve: { categoryGroup: row, refetch },
    size: 'md',
  });

export const GroupEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(groupEditDialog(row, refetch)),
    [dispatch],
  );

  return <EditButton onClick={openFormDialog} size="sm" />;
};
