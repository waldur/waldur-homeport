import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const CategoryEditDialog = lazyComponent(
  () => import('./CategoryEditDialog'),
  'CategoryEditDialog',
);

export const CategoryEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CategoryEditDialog, {
          resolve: { category: row, refetch },
          size: 'md',
        }),
      ),
    [dispatch],
  );

  return <EditButton onClick={openFormDialog} size="sm" />;
};
