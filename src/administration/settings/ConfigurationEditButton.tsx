import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const ConfigurationEditDialog = lazyComponent(
  () => import('./ConfigurationEditDialog'),
  'ConfigurationEditDialog',
);

export const ConfigurationEditButton = ({ item, value }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ConfigurationEditDialog, {
          resolve: { item },
          initialValues: { value },
          size: 'md',
        }),
      ),
    [dispatch],
  );

  return <EditButton onClick={openFormDialog} size="sm" />;
};
