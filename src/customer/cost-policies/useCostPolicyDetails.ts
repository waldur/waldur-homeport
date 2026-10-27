import { useQuery } from '@tanstack/react-query';
import {
  marketplaceCustomerEstimatedCostPoliciesRetrieve,
  marketplaceProjectEstimatedCostPoliciesRetrieve,
  projectCreditsList,
} from 'waldur-js-client';

import { useEarlierInvoices } from '@/project/manage/EarlierInvoices';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { canFixCostPolicy, getCostPolicyFigures } from './costPolicyDetails';
import { CostPolicyType } from './types';

// One call per policy type; their option types differ only in the policy
// type, which the dialogs treat alike.
const RETRIEVE: Record<CostPolicyType, (options: any) => Promise<any>> = {
  project: marketplaceProjectEstimatedCostPoliciesRetrieve,
  organization: marketplaceCustomerEstimatedCostPoliciesRetrieve,
};

/** What the details and fix dialogs read: the policy as it is now, its
 * project's credit and earlier invoices, and what the viewer may do.
 *
 * Both dialogs share the query keys, so moving from one to the other does
 * not fetch again. The earlier invoices are refused to whoever may not see
 * the project's costs (a project role while the organization hides billing
 * in projects); they are then simply absent.
 */
export const useCostPolicyDetails = (
  row,
  type: CostPolicyType,
  customerUuid?: string,
) => {
  const user = useUser();
  const workspaceCustomer = useCustomer();
  // The policy's organization when the opener knows it; see
  // useCanFixCostPolicy.
  const customer = customerUuid ? { uuid: customerUuid } : workspaceCustomer;
  const isProject = type === 'project';

  const { data: policy = row, refetch: refetchPolicy } = useQuery({
    queryKey: ['CostPolicyDetails', type, row.uuid],
    queryFn: () =>
      RETRIEVE[type]({ path: { uuid: row.uuid } }).then(
        (response) => response.data,
      ),
    initialData: row,
    refetchOnWindowFocus: false,
  });
  const { data: credit, refetch: refetchCredit } = useQuery({
    queryKey: ['CostPolicyDetailsProjectCredit', policy.scope_uuid],
    queryFn: () =>
      projectCreditsList({ query: { project_uuid: policy.scope_uuid } }).then(
        (response) => response.data[0] ?? null,
      ),
    enabled: isProject && Boolean(policy.scope_uuid),
    refetchOnWindowFocus: false,
  });
  const { data: earlierInvoices } = useEarlierInvoices(credit);

  const isStaff = Boolean(user?.is_staff);
  const isOwnerOrStaff = checkIsOwnerOrStaff(customer, user);
  return {
    policy,
    credit,
    earlierInvoices,
    figures: getCostPolicyFigures(policy),
    isStaff,
    isOwnerOrStaff,
    canFix: canFixCostPolicy(type, isStaff, isOwnerOrStaff),
    refetch: () => Promise.all([refetchPolicy(), refetchCredit()]),
  };
};
