import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  proposalRequestedOfferingsCancel,
  RequestedOffering,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const CallOfferingDeleteButton = ({
  row,
  refetch,
}: {
  row: RequestedOffering;
  refetch(): void;
}) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the offering {offering_name} ?',
          {
            offering_name: <strong>{row.offering_name}</strong>,
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await proposalRequestedOfferingsCancel({ path: { uuid: row.uuid } });
      await refetch();
      dispatch(showSuccess(translate('Requested offering has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete requested offering.')),
      );
    }
  };
  return (
    <ActionItem
      title={translate('Remove')}
      className="text-danger"
      action={openDialog}
      iconNode={<TrashIcon />}
      iconColor="danger"
      size="sm"
    />
  );
};
