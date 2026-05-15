import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RoleFormDialog = lazyComponent(() =>
  import('./RoleFormDialog').then((module) => ({
    default: module.RoleFormDialog,
  })),
);

export const RoleEditButton = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const openRoleEditDialog = useCallback(
    () =>
      openDialog(RoleFormDialog, {
        resolve: {
          row,
          refetch,
        },
      }),
    [openDialog, row, refetch],
  );

  return (
    <ActionItem
      title={translate('Edit role')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openRoleEditDialog}
    />
  );
};
