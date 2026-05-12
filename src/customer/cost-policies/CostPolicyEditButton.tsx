import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { CostPolicyType } from './types';

const CostPolicyFormDialog = lazyComponent(() =>
  import('./CostPolicyFormDialog').then((module) => ({
    default: module.CostPolicyFormDialog,
  })),
);

interface CostPolicyEditButtonProps {
  row;
  refetch(): void;
  type: CostPolicyType;
}

export const CostPolicyEditButton = ({
  row,
  refetch,
  type,
}: CostPolicyEditButtonProps) => {
  const { openDialog } = useModal();
  const openCostPolicyEditDialog = useCallback(
    () =>
      openDialog(CostPolicyFormDialog, {
        resolve: { row, refetch, type },
      }),
    [row, refetch, type, openDialog],
  );

  return (
    <ActionItem
      title={translate('Edit')}
      action={openCostPolicyEditDialog}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
