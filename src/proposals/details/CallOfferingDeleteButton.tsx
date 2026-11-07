import {
  proposalProtectedCallsOfferingsDestroy,
  RequestedOffering,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const CallOfferingDeleteButton = ({
  row,
  callUuid,
  refetch,
}: {
  row: RequestedOffering;
  callUuid: string;
  refetch(): void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      // The call's own endpoint: it refuses while the call has component
      // rules, resource pools or templates set on the offering, and says so.
      proposalProtectedCallsOfferingsDestroy({
        path: { uuid: callUuid, obj_uuid: row.uuid },
      }),
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
