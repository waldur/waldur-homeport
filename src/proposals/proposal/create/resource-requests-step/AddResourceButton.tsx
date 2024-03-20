import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { Proposal } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';

const ResourceRequestFormDialog = lazyComponent(
  () => import('./ResourceRequestFormDialog'),
  'ResourceRequestFormDialog',
);

interface AddResourceButtonProps {
  proposal: Proposal;
  refetch(): void;
}

export const AddResourceButton = ({
  proposal,
  refetch,
}: AddResourceButtonProps) => {
  const dispatch = useDispatch();
  const openAddResourceDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ResourceRequestFormDialog, {
          resolve: { proposal, refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('Add resource')}
      action={openAddResourceDialog}
      variant="primary"
    />
  );
};
