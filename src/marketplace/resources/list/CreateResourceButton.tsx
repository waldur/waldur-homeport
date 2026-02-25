import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { openModalDialog } from '@waldur/modal/actions';
import { useUser } from '@waldur/workspace/hooks';
import { Customer } from '@waldur/workspace/types';

const MarketplacePopup = lazyComponent(() =>
  import('@waldur/navigation/sidebar/marketplace-popup/MarketplacePopup').then(
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
