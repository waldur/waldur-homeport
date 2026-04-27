import { DownloadSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { ImportDialogProps } from './types';

const ResourceImportDialog = lazyComponent(() =>
  import('./ResourceImportDialog').then((module) => ({
    default: module.ResourceImportDialog,
  })),
);

export const ResourceImportButton: React.FC<ImportDialogProps['resolve']> = (
  props,
) => {
  const dispatch = useDispatch();

  const openDialog = () => {
    dispatch(
      openModalDialog(ResourceImportDialog, {
        resolve: props,
        size: 'lg',
      }),
    );
  };

  return (
    <ActionButton
      title={translate('Import')}
      action={openDialog}
      iconNode={<DownloadSimpleIcon weight="bold" />}
    />
  );
};
