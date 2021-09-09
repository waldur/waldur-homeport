import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { deleteInvoiceItem } from '../api';

export const DeleteInvoiceItemButton = ({ item, refreshInvoiceItems }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }
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
    <ActionButton
      action={callback}
      title={translate('Remove')}
      icon="fa fa-trash"
    />
  );
};
