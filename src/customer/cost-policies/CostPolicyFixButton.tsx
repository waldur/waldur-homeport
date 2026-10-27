import { WrenchIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { canFixCostPolicy } from './costPolicyDetails';
import { CostPolicyType } from './types';

const CostPolicyFixDialog = lazyComponent(() =>
  import('./CostPolicyFixDialog').then((module) => ({
    default: module.CostPolicyFixDialog,
  })),
);

interface CostPolicyFixButtonProps {
  row;
  refetch(): void;
  type: CostPolicyType;
}

/** Offered only to those who may change the policy, and only while it is over
 * its limit: there is nothing to fix otherwise. */
export const CostPolicyFixButton = ({
  row,
  refetch,
  type,
}: CostPolicyFixButtonProps) => {
  const user = useUser();
  const customer = useCustomer();
  const { openDialog } = useModal();
  const openFix = useCallback(
    () =>
      openDialog(CostPolicyFixDialog, {
        size: 'lg',
        resolve: { row, refetch, type },
      }),
    [row, refetch, type, openDialog],
  );
  if (
    !row.trigger_status?.triggered ||
    !canFixCostPolicy(
      type,
      Boolean(user?.is_staff),
      checkIsOwnerOrStaff(customer, user),
    )
  ) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Fix…')}
      action={openFix}
      iconNode={<WrenchIcon weight="bold" />}
    />
  );
};
