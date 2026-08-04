import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RoleDescriptionEditDialog = lazyComponent(() =>
  import('./RoleDescriptionEditDialog').then((module) => ({
    default: module.RoleDescriptionEditDialog,
  })),
);

export const RoleDescriptionEditButton = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const openRoleEditDialog = useCallback(
    () =>
      openDialog(RoleDescriptionEditDialog, {
        resolve: {
          row,
          refetch,
        },
      }),
    [],
  );

  return (
    <ActionItem
      title={translate('Edit name translations')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openRoleEditDialog}
    />
  );
};
