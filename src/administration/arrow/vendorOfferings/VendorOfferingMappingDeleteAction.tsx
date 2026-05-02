import {
  adminArrowVendorOfferingMappingsDestroy,
  ArrowVendorOfferingMapping,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const VendorOfferingMappingDeleteAction = ({
  row,
  refetch,
}: {
  row: ArrowVendorOfferingMapping;
  refetch: () => void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      adminArrowVendorOfferingMappingsDestroy({ path: { uuid: row.uuid } }),
    refetch,

    confirmation: {
      title: translate('Confirm deletion'),

      body: translate(
        'Are you sure you want to delete the mapping for "{vendor}"?',
        { vendor: row.arrow_vendor_name },
      ),

      options: {
        forDeletion: true,
      },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
