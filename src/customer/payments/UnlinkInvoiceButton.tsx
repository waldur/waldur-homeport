import { FileTextIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { paymentsUnlinkFromInvoice } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { updatePaymentsList } from './utils';

export const UnlinkInvoiceButton = ({ row: payment }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const callback = async () => {
    try {
      await paymentsUnlinkFromInvoice({ path: { uuid: payment.uuid } });
      dispatch(
        showSuccess(
          translate('Invoice has been successfully unlinked from payment.'),
        ),
      );
      dispatch(updatePaymentsList(customer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to unlink invoice from the payment.'),
        ),
      );
    }
  };

  return (
    <ActionItem
      title={translate('Unlink invoice')}
      action={callback}
      iconNode={<FileTextIcon weight="bold" />}
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
