import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const UserDetailsDialog = lazyComponent(() =>
  import('./UserDetailsDialog').then((module) => ({
    default: module.UserDetailsDialog,
  })),
);

export const UserDetailsButton: FunctionComponent<{ row }> = ({ row }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Details')}
      size="sm"
      iconNode={<EyeIcon weight="bold" />}
      action={() =>
        openDialog(UserDetailsDialog, {
          resolve: { user: row },
          size: 'lg',
        })
      }
    />
  );
};
