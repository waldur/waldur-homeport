import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsRemoveSoftwareCatalog } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const DeleteSoftwareCatalogButton: FunctionComponent<{
  offering;
  softwareCatalog;
  refetch;
}> = ({ offering, softwareCatalog, refetch }) => {
  const dispatch = useDispatch();

  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        formatJsxTemplate(
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
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await marketplaceProviderOfferingsRemoveSoftwareCatalog({
        path: {
          uuid: offering.uuid,
        },
        body: {
          offering_catalog_uuid: softwareCatalog.uuid,
        },
      });
      dispatch(showSuccess(translate('Software catalog has been deleted.')));
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to delete software catalog.'),
        ),
      );
    }
  };

  return (
    <ActionItem
      className="text-danger"
      iconColor="danger"
      title={translate('Delete')}
      action={handler}
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
