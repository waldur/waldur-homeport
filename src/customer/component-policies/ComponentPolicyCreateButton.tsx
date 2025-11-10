import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const ComponentPolicyFormDialog = lazyComponent(() =>
  import('./ComponentPolicyFormDialog').then((module) => ({
    default: module.ComponentPolicyFormDialog,
  })),
);

export const ComponentPolicyCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ComponentPolicyFormDialog, {
          resolve: { refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openFormDialog} />;
};
