import { DownloadSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
