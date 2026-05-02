import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { ImportDialogProps } from './types';

const ResourceImportDialog = lazyComponent(() =>
  import('./ResourceImportDialog').then((module) => ({
    default: module.ResourceImportDialog,
  })),
);

export const ResourceImportButton: FC<ImportDialogProps['resolve']> = (
  props,
) => {
  const { openDialog } = useModal();

  return (
    <ActionButton
      title={translate('Import')}
      action={() => {
        openDialog(ResourceImportDialog, {
          resolve: props,
          size: 'lg',
        });
      }}
      iconNode={<DownloadSimpleIcon weight="bold" />}
    />
  );
};
