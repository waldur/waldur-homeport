import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { deleteInvoiceItem } from '../api';

export const InvoiceItemDelete = ({ item, refreshInvoiceItems }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to remove invoice item {name}?', {
          name: item.name,
        }),
      );
    } catch {
      return;
    }
    try {
      await deleteInvoiceItem(item.uuid);
      refreshInvoiceItems();
      dispatch(showSuccess(translate('Invoice item has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete invoice item.')),
      );
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Remove')}
      icon="fa fa-trash"
    />
  );
};
