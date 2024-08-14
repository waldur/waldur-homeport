import { PlusCircle } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
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
  return (
    <ActionButton
      action={openFormDialog}
      iconNode={<PlusCircle weight="bold" />}
      title={translate('Add')}
      variant="primary"
    />
  );
};
