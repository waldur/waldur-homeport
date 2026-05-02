import { FunctionComponent } from 'react';
import { marketplaceProviderOfferingsRemoveSoftwareCatalog } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeleteSoftwareCatalogButton: FunctionComponent<{
  offering;
  softwareCatalog;
  refetch;
}> = ({ offering, softwareCatalog, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsRemoveSoftwareCatalog({
        path: {
          uuid: offering.uuid,
        },
        body: {
          offering_catalog_uuid: softwareCatalog.uuid,
        },
      }),
    successMessage: translate('Software catalog has been deleted.'),
    errorMessage: translate('Unable to delete software catalog.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: formatJsxTemplate(
        translate(
          'Are you sure you want to delete software catalog {catalogName}?',
        ),
        {
          catalogName: (
            <strong>
              {softwareCatalog.catalog?.name || translate('Unknown')}
            </strong>
          ),
        },
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
