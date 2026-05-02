import { marketplaceCustomerComponentUsagePoliciesDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const ComponentPolicyDeleteButton = ({ row, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceCustomerComponentUsagePoliciesDestroy({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Component usage policy has been deleted.'),
    errorMessage: translate('Unable to delete component usage policy.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the component usage policy?',
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};
