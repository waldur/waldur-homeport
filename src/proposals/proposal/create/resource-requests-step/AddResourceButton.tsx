import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { openModalDialog } from '@/modal/actions';
import { Proposal } from '@/proposals/types';
import { ActionButton } from '@/table/ActionButton';

const ResourceRequestFormDialog = lazyComponent(() =>
  import('./ResourceRequestFormDialog').then((module) => ({
    default: module.ResourceRequestFormDialog,
  })),
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
      iconNode={<PlusCircleIcon weight="bold" />}
      action={openAddResourceDialog}
    />
  );
};
