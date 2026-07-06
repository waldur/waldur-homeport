import { HashIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const UserPosixIdentitiesDialog = lazyComponent(() =>
  import('./UserPosixIdentitiesDialog').then((module) => ({
    default: module.UserPosixIdentitiesDialog,
  })),
);

export const UserPosixIdentitiesButton: FC<{ userUuid?: string }> = ({
  userUuid,
}) => {
  const { openDialog } = useModal();
  if (!isFeatureVisible(MarketplaceFeatures.show_posix_id_pools) || !userUuid) {
    return null;
  }
  return (
    <ActionButton
      action={() =>
        openDialog(UserPosixIdentitiesDialog, {
          resolve: { userUuid },
          size: 'lg',
        })
      }
      title={translate('POSIX identities')}
      iconNode={<HashIcon weight="bold" />}
      variant="secondary"
    />
  );
};
