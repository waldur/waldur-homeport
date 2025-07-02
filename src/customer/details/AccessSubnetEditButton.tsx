import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

import { AccessSubnetFormProps } from './AccessSubnetForm';

const AccessSubnetForm = lazyComponent(() =>
  import('./AccessSubnetForm').then((module) => ({
    default: module.AccessSubnetForm,
  })),
);

export const AccessSubnetEditButton = ({
  row,
  refetch,
}: AccessSubnetFormProps) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(AccessSubnetForm, {
          refetch,
          row,
          size: 'lg',
        }),
      ),
    [dispatch, row, refetch],
  );

  return <EditAction action={openFormDialog} />;
};
