import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const ConfigurationEditDialog = lazyComponent(() =>
  import('./ConfigurationEditDialog').then((module) => ({
    default: module.ConfigurationEditDialog,
  })),
);

export const ConfigurationEditButton = ({ item, value }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ConfigurationEditDialog, {
          resolve: { item },
          initialValues: { value },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <EditButton onClick={openFormDialog} size="sm" />;
};
