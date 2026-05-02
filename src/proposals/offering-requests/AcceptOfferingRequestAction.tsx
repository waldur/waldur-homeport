import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  proposalRequestedOfferingsAccept,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface AcceptOfferingRequestActionProps {
  row: ProviderRequestedOffering;
  refetch: () => void;
}

export const AcceptOfferingRequestAction: FC<
  AcceptOfferingRequestActionProps
> = ({ row, refetch }) => {
  const { mutate: accept, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalRequestedOfferingsAccept({ path: { uuid: row.uuid } }),
    refetch,
    confirmation: {
      title: translate('Accepting offering request'),
      body: translate(
        'Are you sure you want to accept the {name} offering request?',
        {
          name: <b>{row.offering_name}</b>,
        },
        formatJsxTemplate,
      ),
    },
    successMessage: translate('Offering request has been accepted.'),
    errorMessage: translate('Unable to accept offering request.'),
  });
  return (
    <ActionItem
      action={() => accept()}
      title={translate('Accept')}
      iconNode={<CheckIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
