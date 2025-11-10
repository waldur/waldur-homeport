import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const ComponentPolicyFormDialog = lazyComponent(() =>
  import('./ComponentPolicyFormDialog').then((module) => ({
    default: module.ComponentPolicyFormDialog,
  })),
);

export const ComponentPolicyEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ComponentPolicyFormDialog, {
          resolve: { policy: row, refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <EditAction action={openFormDialog} />;
};
