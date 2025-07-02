import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { paymentsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { updatePaymentsList } from './utils';

export const DeletePaymentButton = ({ row: payment }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  return (
    <ActionItem
      title={translate('Delete')}
      action={async () => {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate('Are you sure you want to delete the payment?'),
            { forDeletion: true },
          );
        } catch {
          return;
        }
        try {
          await paymentsDestroy({ path: { uuid: payment.uuid } });
          dispatch(showSuccess(translate('Payment has been deleted.')));
          dispatch(closeModalDialog());
          dispatch(updatePaymentsList(customer));
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to delete payment.')),
          );
        }
      }}
      iconNode={<TrashIcon weight="bold" />}
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
      className="text-danger"
      iconColor="danger"
    />
  );
};
