import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const PasskeyRenameDialog = lazyComponent(() =>
  import('./PasskeyRenameDialog').then((module) => ({
    default: module.PasskeyRenameDialog,
  })),
);

export const PasskeyRenameButton: FunctionComponent<{ row; refetch? }> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const open = useCallback(
    () => openDialog(PasskeyRenameDialog, { resolve: { row, refetch } }),
    [openDialog, row, refetch],
  );

  return (
    <ActionItem
      title={translate('Rename')}
      action={open}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
