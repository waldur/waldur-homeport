import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const GroupCreateDialog = lazyComponent(
  () => import('./GroupFromDialog'),
  'GroupFromDialog',
);

const groupCreateDialog = (refetch) =>
  openModalDialog(GroupCreateDialog, { resolve: { refetch }, size: 'md' });

export const GroupCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(groupCreateDialog(refetch)),
    [dispatch],
  );

  return <AddButton action={openFormDialog} />;
};
