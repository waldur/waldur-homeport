import { UsersIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { PosixIdPool } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const PosixIdPoolIdentitiesDialog = lazyComponent(() =>
  import('./PosixIdPoolIdentitiesDialog').then((m) => ({
    default: m.PosixIdPoolIdentitiesDialog,
  })),
);

interface PosixIdPoolIdentitiesButtonProps {
  row: PosixIdPool;
}

export const PosixIdPoolIdentitiesButton: FC<
  PosixIdPoolIdentitiesButtonProps
> = ({ row }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('View identities')}
      action={() =>
        openDialog(PosixIdPoolIdentitiesDialog, {
          resolve: { pool: row },
          size: 'lg',
        })
      }
      iconNode={<UsersIcon weight="bold" />}
    />
  );
};
