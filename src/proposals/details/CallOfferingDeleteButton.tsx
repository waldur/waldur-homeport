import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteRequestedOffering } from '@waldur/proposals/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

export const CallOfferingDeleteButton = ({ row, refetch }) => {
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
      );
    } catch {
      return;
    }
    try {
      await deleteRequestedOffering(row.url);
      await refetch();
      dispatch(showSuccess(translate('Requested offering has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete requested offering.')),
      );
    }
  };
  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="outline-danger"
      iconNode={<Trash />}
      size="sm"
    />
  );
};
