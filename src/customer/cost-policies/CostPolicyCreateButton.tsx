import { useCallback } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { CostPolicyType } from './types';

const CostPolicyFormDialog = lazyComponent(() =>
  import('./CostPolicyFormDialog').then((module) => ({
    default: module.CostPolicyFormDialog,
  })),
);

interface CostPolicyCreateButtonProps {
  refetch(): void;
  type: CostPolicyType;
}

export const CostPolicyCreateButton = ({
  refetch,
  type,
}: CostPolicyCreateButtonProps) => {
  const { openDialog } = useModal();
  const openCostPolicyFormDialog = useCallback(
    () =>
      openDialog(CostPolicyFormDialog, {
        resolve: { type, refetch },
      }),
    [type, refetch, openDialog],
  );

  return <AddButton action={openCostPolicyFormDialog} />;
};
