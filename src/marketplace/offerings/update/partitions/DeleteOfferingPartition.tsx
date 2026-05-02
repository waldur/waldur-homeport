import { FC } from 'react';
import {
  marketplaceProviderOfferingsRemovePartition,
  NestedPartition,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeleteOfferingPartition: FC<{
  row: NestedPartition;
  offering;
  refetch;
}> = ({ offering, row, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsRemovePartition({
        path: { uuid: offering.uuid },
        body: { partition_uuid: row.uuid },
      }),
    successMessage: translate('Offering partition has been deleted.'),
    errorMessage: translate('Unable to delete offering partition.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: formatJsxTemplate(
        translate('Are you sure you want to delete offering partition {name}?'),
        {
          name: <strong>{row.partition_name || translate('Unknown')}</strong>,
        },
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};
