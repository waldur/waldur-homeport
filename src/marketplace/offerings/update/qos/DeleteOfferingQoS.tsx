import { FC } from 'react';
import {
  marketplaceProviderOfferingsRemoveQos,
  NestedQoS,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeleteOfferingQoS: FC<{
  row: NestedQoS;
  offering;
  refetch;
}> = ({ offering, row, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsRemoveQos({
        path: { uuid: offering.uuid },
        body: { qos_uuid: row.uuid },
      }),
    successMessage: translate('QoS profile has been deleted.'),
    errorMessage: translate('Unable to delete QoS profile.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: formatJsxTemplate(
        translate('Are you sure you want to delete QoS profile {name}?'),
        {
          name: <strong>{row.name || translate('Unknown')}</strong>,
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
