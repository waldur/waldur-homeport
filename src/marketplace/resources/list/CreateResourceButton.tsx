import { FC, useCallback } from 'react';
import { Project } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { canUseMarketplaceShopUi } from '@/marketplace/canUseMarketplaceShopUi';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

const MarketplacePopup = lazyComponent(() =>
  import('@/navigation/sidebar/marketplace-popup/MarketplacePopup').then(
    (module) => ({ default: module.MarketplacePopup }),
  ),
);

interface CreateResourceButtonProps {
  organization?: Customer;
  project?: Project;
  categoryUuid?: string;
}

export const CreateResourceButton: FC<CreateResourceButtonProps> = (props) => {
  const user = useUser();
  const { openDialog } = useModal();

  const openFormDialog = useCallback(
    () =>
      openDialog(MarketplacePopup, {
        size: 'lg',
        resolve: props,
      }),
    [openDialog, props],
  );

  if (!canUseMarketplaceShopUi(user)) {
    return null;
  }

  if (!hasPermissionOnAnyScope(user, PermissionEnum.CREATE_ORDER)) {
    return null;
  }

  return <AddButton action={openFormDialog} />;
};
