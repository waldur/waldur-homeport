import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const CategoryEditDialog = lazyComponent(
  () => import('./CategoryEditDialog'),
  'CategoryEditDialog',
);

export const CategoryEditAction = ({ row, refetch }) => {
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

  return <EditAction action={openFormDialog} />;
};
