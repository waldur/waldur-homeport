import { ClockIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const UpdateUserExpirationDialog = lazyComponent(() =>
  import('./UpdateUserExpirationDialog').then((module) => ({
    default: module.UpdateUserExpirationDialog,
  })),
);

export const UpdateUserExpirationAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Update expiration')}
      iconNode={<ClockIcon weight="bold" />}
      action={() =>
        openDialog(UpdateUserExpirationDialog, {
          resolve: { row, refetch },
          size: 'sm',
        })
      }
    />
  );
};
