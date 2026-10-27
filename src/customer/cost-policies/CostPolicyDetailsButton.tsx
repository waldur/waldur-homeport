import { InfoIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { CostPolicyType } from './types';

const CostPolicyDetailsDialog = lazyComponent(() =>
  import('./CostPolicyDetailsDialog').then((module) => ({
    default: module.CostPolicyDetailsDialog,
  })),
);

interface CostPolicyDetailsButtonProps {
  row;
  refetch(): void;
  type: CostPolicyType;
}

export const CostPolicyDetailsButton = ({
  row,
  refetch,
  type,
}: CostPolicyDetailsButtonProps) => {
  const { openDialog } = useModal();
  const openDetails = useCallback(
    () =>
      openDialog(CostPolicyDetailsDialog, {
        size: 'lg',
        resolve: { row, refetch, type },
      }),
    [row, refetch, type, openDialog],
  );

  return (
    <ActionItem
      title={translate('Details')}
      action={openDetails}
      iconNode={<InfoIcon weight="bold" />}
    />
  );
};
