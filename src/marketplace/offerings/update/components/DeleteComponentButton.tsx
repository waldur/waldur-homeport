import { marketplaceProviderOfferingsRemoveOfferingComponent } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useOpenOfferingChange } from '@/marketplace/offerings/dependents/useOpenOfferingChange';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeleteComponentButton = ({ offering, component, refetch }) => {
  const openChange = useOpenOfferingChange();
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() =>
        openChange({
          title: translate('Confirmation'),
          body: translate(
            'Are you sure you want to delete component {name}?',
            { name: <b>{component.name}</b> },
            formatJsxTemplate,
          ),
          change: 'component_removed',
          offeringUuid: offering.uuid,
          componentType: component.type,
          confirmLabel: translate('Delete'),
          forDeletion: true,
          mutationFn: () =>
            marketplaceProviderOfferingsRemoveOfferingComponent({
              path: { uuid: offering.uuid },
              body: { uuid: component.uuid },
            }),
          successMessage: translate('Component has been removed.'),
          errorMessage: translate('Unable to remove component.'),
          onSuccess: refetch,
        })
      }
    />
  );
};
