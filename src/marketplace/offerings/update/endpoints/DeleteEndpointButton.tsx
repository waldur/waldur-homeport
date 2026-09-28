import { marketplaceProviderOfferingsDeleteEndpoint } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const DeleteEndpointButton = ({ endpoint, offering, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsDeleteEndpoint({
        path: { uuid: offering.uuid },
        body: { uuid: endpoint.uuid },
      }),
    successMessage: translate('Endpoint has been removed.'),
    errorMessage: translate('Unable to remove endpoint.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete endpoint {name}?',
        {
          name: <b>{endpoint.name}</b>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });
  return (
    <BaseButton
      variant="danger"
      onClick={() => deleteMutation.mutate()}
      pending={deleteMutation.isPending}
      label={translate('Delete')}
      size="sm"
    />
  );
};
