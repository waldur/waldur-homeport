import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const SupportUserFormDialog = lazyComponent(() =>
  import('./SupportUserFormDialog').then((module) => ({
    default: module.SupportUserFormDialog,
  })),
);

export const SupportUserEditButton = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        openDialog(SupportUserFormDialog, {
          resolve: { supportUser: row, refetch },
        })
      }
    />
  );
};
