import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { canFixCostPolicy } from './costPolicyDetails';
import { CostPolicyType } from './types';

const CostPolicyDetailsDialog = lazyComponent(() =>
  import('./CostPolicyDetailsDialog').then((module) => ({
    default: module.CostPolicyDetailsDialog,
  })),
);
const CostPolicyFixDialog = lazyComponent(() =>
  import('./CostPolicyFixDialog').then((module) => ({
    default: module.CostPolicyFixDialog,
  })),
);

/** Whether this user may fix the policy now: it is over its limit, and they
 * may change it.
 *
 * `customerUuid` is the policy's organization when the page knows it (a
 * resource does); otherwise the organization in the workspace is assumed,
 * which a page reached by a plain link may not have.
 */
export const useCanFixCostPolicy = (
  row,
  type: CostPolicyType,
  customerUuid?: string,
) => {
  const user = useUser();
  const workspaceCustomer = useCustomer();
  const customer = customerUuid ? { uuid: customerUuid } : workspaceCustomer;
  return (
    Boolean(row?.trigger_status?.triggered) &&
    canFixCostPolicy(
      type,
      Boolean(user?.is_staff),
      checkIsOwnerOrStaff(customer, user),
    )
  );
};

/** Opens the details and fix dialogs of a cost policy from anywhere. */
export const useCostPolicyDialogs = (
  row,
  type: CostPolicyType,
  customerUuid?: string,
) => {
  const { openDialog } = useModal();
  const resolve = { row, type, customerUuid };
  return {
    openDetails: () =>
      openDialog(CostPolicyDetailsDialog, { size: 'lg', resolve }),
    openFix: () => openDialog(CostPolicyFixDialog, { size: 'lg', resolve }),
  };
};

/** "Details" for everyone, and "Fix…" for those who may fix the policy while
 * it is over its limit. */
export const CostPolicyLinks: FC<{ row; type: CostPolicyType }> = ({
  row,
  type,
}) => {
  const canFix = useCanFixCostPolicy(row, type);
  const { openDetails, openFix } = useCostPolicyDialogs(row, type);
  return (
    <span className="inline-flex flex-nowrap gap-3 whitespace-nowrap">
      <BaseButton
        variant="text-primary"
        size="sm"
        label={translate('Details')}
        onClick={openDetails}
      />
      {canFix ? (
        <BaseButton
          variant="text-primary"
          size="sm"
          label={translate('Fix…')}
          onClick={openFix}
        />
      ) : null}
    </span>
  );
};
