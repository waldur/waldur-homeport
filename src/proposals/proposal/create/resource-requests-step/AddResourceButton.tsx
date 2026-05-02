import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
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
  const { openDialog } = useModal();
  const openAddResourceDialog = useCallback(
    () =>
      openDialog(ResourceRequestFormDialog, {
        resolve: { proposal, refetch },
        size: 'lg',
      }),
    [],
  );

  return (
    <ActionButton
      title={translate('Add resource')}
      iconNode={<PlusCircleIcon weight="bold" />}
      action={openAddResourceDialog}
    />
  );
};
