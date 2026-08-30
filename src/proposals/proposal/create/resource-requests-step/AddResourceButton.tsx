import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { BaseButton } from '@/core/buttons/BaseButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { Proposal } from '@/proposals/types';

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
    // Medium: the card's title row, like the team block's, is not the page's
    // primary action bar.
    <BaseButton
      label={translate('Add resource')}
      iconNode={<PlusCircleIcon weight="bold" />}
      onClick={openAddResourceDialog}
      variant="tertiary"
    />
  );
};
