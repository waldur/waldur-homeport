import {
  proposalRequestedOfferingsCancel,
  RequestedOffering,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const CallOfferingDeleteButton = ({
  row,
  refetch,
}: {
  row: RequestedOffering;
  refetch(): void;
}) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      proposalRequestedOfferingsCancel({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the offering {offering_name} ?',
        {
          offering_name: <strong>{row.offering_name}</strong>,
        },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Requested offering has been removed.'),
    errorMessage: translate('Unable to delete requested offering.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
