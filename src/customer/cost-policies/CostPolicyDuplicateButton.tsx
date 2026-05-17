import { CopyIcon } from '@phosphor-icons/react';
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

interface CostPolicyDuplicateButtonProps {
  row;
  refetch(): void;
  type: CostPolicyType;
}

export const CostPolicyDuplicateButton = ({
  row,
  refetch,
  type,
}: CostPolicyDuplicateButtonProps) => {
  const { openDialog } = useModal();
  const openDuplicateDialog = useCallback(
    () =>
      openDialog(CostPolicyFormDialog, {
        resolve: { row, refetch, type, isDuplicate: true },
      }),
    [row, refetch, type, openDialog],
  );

  return (
    <ActionItem
      title={translate('Duplicate')}
      action={openDuplicateDialog}
      iconNode={<CopyIcon weight="bold" />}
    />
  );
};
