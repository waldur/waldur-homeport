import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const AccessSubnetEditDialog = lazyComponent(
  () => import('./AccessSubnetEditDialog'),
  'AccessSubnetEditDialog',
);

export const AccessSubnetEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(AccessSubnetEditDialog, {
          refetch: refetch,
          row: row,
          size: 'md',
        }),
      ),
    [dispatch],
  );

  return <EditButton onClick={openFormDialog} size="sm" />;
};
