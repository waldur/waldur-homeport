import { Trash } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import { deletePayment } from '@waldur/customer/payments/store/actions';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const DeletePaymentButton = ({ payment }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  return (
    <ActionButton
      title={translate('Delete')}
      action={async () => {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate('Are you sure you want to delete the payment?'),
          );
        } catch {
          return;
        }
        dispatch(deletePayment(payment.uuid));
      }}
      iconNode={<Trash />}
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
