import { useCallback } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { Offering } from '@/marketplace/types';
import { useModal } from '@/modal/actions';

const PolicyCreateDialog = lazyComponent(() =>
  import('./PolicyCreateDialog').then((module) => ({
    default: module.PolicyCreateDialog,
  })),
);

interface CostPolicyCreateButtonProps {
  offering: Offering;
  refetch(): void;
}

export const CostPolicyCreateButton = ({
  offering,
  refetch,
}: CostPolicyCreateButtonProps) => {
  const { openDialog } = useModal();

  const openPolicyCreateDialog = useCallback(
    () =>
      openDialog(PolicyCreateDialog, {
        size: 'lg',
        type: 'cost',
        offering,
        refetch,
      }),
    [offering, refetch],
  );

  return <AddButton action={openPolicyCreateDialog} />;
};
