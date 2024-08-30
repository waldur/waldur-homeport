import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const CategoryCreateDialog = lazyComponent(
  () => import('./CategoryEditDialog'),
  'CategoryEditDialog',
);

const categoryCreateDialog = (refetch) =>
  openModalDialog(CategoryCreateDialog, { resolve: { refetch }, size: 'md' });

export const CategoryCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(categoryCreateDialog(refetch)),
    [dispatch],
  );

  return <AddButton action={openFormDialog} />;
};
