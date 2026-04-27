import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceProviderOfferingsRemovePartition,
  NestedPartition,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const DeleteOfferingPartition: FC<{
  row: NestedPartition;
  offering;
  refetch;
}> = ({ offering, row, refetch }) => {
  const dispatch = useDispatch();

  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        formatJsxTemplate(
          translate(
            'Are you sure you want to delete offering partition {name}?',
          ),
          {
            name: <strong>{row.partition_name || translate('Unknown')}</strong>,
          },
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await marketplaceProviderOfferingsRemovePartition({
        path: { uuid: offering.uuid },
        body: { partition_uuid: row.uuid },
      });
      dispatch(showSuccess(translate('Offering partition has been deleted.')));
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to delete offering partition.'),
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
