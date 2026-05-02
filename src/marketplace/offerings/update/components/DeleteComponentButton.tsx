import { marketplaceProviderOfferingsRemoveOfferingComponent } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeleteComponentButton = ({ offering, component, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsRemoveOfferingComponent({
        path: { uuid: offering.uuid },
        body: { uuid: component.uuid },
      }),
    successMessage: translate('Component has been removed.'),
    errorMessage: translate('Unable to remove component.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete component {name}?',
        { name: <b>{component.name}</b> },
        formatJsxTemplate,
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
