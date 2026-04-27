import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { openModalDialog } from '@/modal/actions';

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
          size: item.key === 'LOGIN_PAGE_LAYOUT' ? 'lg' : 'md',
        }),
      ),
    [dispatch],
  );

  return <CompactEditButton onClick={openFormDialog} />;
};
