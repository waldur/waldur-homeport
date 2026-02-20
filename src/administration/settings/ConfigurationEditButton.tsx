import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
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
          resolve: { item, initialValues: { value } },
          size: 'md',
        }),
      ),
    [dispatch],
  );

  return <CompactEditButton onClick={openFormDialog} />;
};
