import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  proposalRequestedOfferingsCancel,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface RejectOfferingRequestActionProps {
  row: ProviderRequestedOffering;
  refetch: () => void;
}

export const RejectOfferingRequestAction: FC<
  RejectOfferingRequestActionProps
> = ({ row, refetch }) => {
  const { mutate: reject, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalRequestedOfferingsCancel({ path: { uuid: row.uuid } }),
    refetch,
    confirmation: {
      title: translate('Rejecting offering request'),
      body: translate(
        'Are you sure you want to reject the {name} offering request?',
        {
          name: <b>{row.offering_name}</b>,
        },
        formatJsxTemplate,
      ),
    },
    successMessage: translate('Offering request has been rejected.'),
    errorMessage: translate('Unable to reject offering request.'),
  });
  return (
    <ActionItem
      action={() => reject()}
      title={translate('Reject')}
      iconNode={<XIcon weight="bold" />}
      className="text-danger"
      disabled={isPending}
    />
  );
};
