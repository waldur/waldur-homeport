import { useCallback } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const PolicyCreateDialog = lazyComponent(() =>
  import('./PolicyCreateDialog').then((module) => ({
    default: module.PolicyCreateDialog,
  })),
);

interface UsagePolicyCreateButtonProps {
  offering: Offering;
  refetch(): void;
}

export const UsagePolicyCreateButton = ({
  offering,
  refetch,
}: UsagePolicyCreateButtonProps) => {
  const { openDialog } = useModal();

  const openPolicyCreateDialog = useCallback(
    () =>
      openDialog(PolicyCreateDialog, {
        size: 'lg',
        type: 'usage',
        offering,
        refetch,
      }),
    [offering, refetch],
  );

  return <AddButton action={openPolicyCreateDialog} />;
};
