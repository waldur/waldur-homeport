import { marketplaceProviderOfferingsDeleteEndpoint } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CompactActionButton } from '@/table/CompactActionButton';

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
    <CompactActionButton
      variant="danger"
      action={() => deleteMutation.mutate()}
      pending={deleteMutation.isPending}
      title={translate('Delete')}
    />
  );
};
