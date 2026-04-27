import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { openModalDialog } from '@/modal/actions';
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
  const dispatch = useDispatch();

  if (
    isFeatureVisible(MarketplaceFeatures.hide_marketplace_from_end_users) &&
    !user?.is_staff
  ) {
    return null;
  }

  if (!hasPermissionOnAnyScope(user, PermissionEnum.CREATE_ORDER)) {
    return null;
  }

  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(MarketplacePopup, {
          size: 'lg',
          resolve: props,
        }),
      ),
    [dispatch],
  );
  return <AddButton action={openFormDialog} />;
};
