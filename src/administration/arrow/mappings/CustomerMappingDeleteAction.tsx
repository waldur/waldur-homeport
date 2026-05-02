import type { ArrowCustomerMapping } from 'waldur-js-client';
import { adminArrowCustomerMappingsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { arrowQueryKeys } from '../api';

export const CustomerMappingDeleteAction = ({
  row,
  refetch,
}: {
  row: ArrowCustomerMapping;
  refetch: () => void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, string>({
    mutationFn: (uuid) => adminArrowCustomerMappingsDestroy({ path: { uuid } }),
    invalidateQueries: [{ queryKey: arrowQueryKeys.customerMappings() }],
    refetch,
    successMessage: translate('Customer mapping has been deleted.'),
    errorMessage: translate('Unable to delete customer mapping.'),
    confirmation: {
      title: translate('Confirm deletion'),
      body: translate(
        'Are you sure you want to delete this customer mapping? This will not delete any synced data.',
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => mutate(row.uuid)}
      disabled={isPending}
    />
  );
};
