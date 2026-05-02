import {
  marketplaceCustomerEstimatedCostPoliciesDestroy,
  marketplaceProjectEstimatedCostPoliciesDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { CostPolicyType } from './types';

export const CostPolicyDeleteButton = ({
  row,
  refetch,
  type,
}: {
  row;
  refetch;
  type: CostPolicyType;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      type === 'project'
        ? marketplaceProjectEstimatedCostPoliciesDestroy({
            path: { uuid: row.uuid },
          })
        : marketplaceCustomerEstimatedCostPoliciesDestroy({
            path: { uuid: row.uuid },
          }),
    successMessage: translate('Cost policy has been deleted.'),
    errorMessage: translate('Unable to delete cost policy.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body:
        type === 'project'
          ? translate(
              'Are you sure you want to delete the cost policy for project {name}?',
              { name: <strong>{row.scope_name}</strong> },
              formatJsxTemplate,
            )
          : translate(
              'Are you sure you want to delete the cost policy for organization {name}?',
              { name: <strong>{row.scope_name}</strong> },
              formatJsxTemplate,
            ),
      options: { forDeletion: true },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
