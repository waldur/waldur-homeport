import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditRoleDialog = lazyComponent(() =>
  import('./EditRoleDialog').then((module) => ({
    default: module.EditRoleDialog,
  })),
);

export const EditRoleAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        openDialog(EditRoleDialog, {
          resolve: { row, refetch },
        })
      }
    />
  );
};
