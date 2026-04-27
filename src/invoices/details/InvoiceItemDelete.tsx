import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { invoiceItemsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
      await invoiceItemsDestroy({ path: { uuid: item.uuid } });
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
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
