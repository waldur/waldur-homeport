import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { Customer, Project } from '@waldur/workspace/types';

const MarketplacePopup = lazyComponent(
  () => import('@waldur/navigation/sidebar/marketplace-popup/MarketplacePopup'),
  'MarketplacePopup',
);

interface CreateResourceButtonProps {
  organization?: Customer;
  project?: Project;
  categoryUuid?: string;
}

export const CreateResourceButton: FC<CreateResourceButtonProps> = (props) => {
  const dispatch = useDispatch();
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
