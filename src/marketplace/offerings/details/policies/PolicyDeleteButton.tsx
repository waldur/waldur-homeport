import {
  marketplaceOfferingEstimatedCostPoliciesDestroy,
  marketplaceOfferingUsagePoliciesDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { OfferingPolicyType } from './types';

export const PolicyDeleteAction = ({
  row,
  type,
  refetch,
}: {
  row;
  type: OfferingPolicyType;
  refetch;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      type === 'usage'
        ? marketplaceOfferingUsagePoliciesDestroy({
            path: { uuid: row.uuid },
          })
        : marketplaceOfferingEstimatedCostPoliciesDestroy({
            path: { uuid: row.uuid },
          }),
    successMessage: translate('Policy has been removed.'),
    errorMessage: translate('Unable to delete policy.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the policy for offering {name}?',
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
