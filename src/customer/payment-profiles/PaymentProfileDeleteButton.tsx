import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { paymentProfilesDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog, waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer } from '@/workspace/selectors';

import { getCustomer as getCustomerApi } from '../utils';

export const PaymentProfileDeleteButton = (props) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the payment profile?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await paymentProfilesDestroy({ path: { uuid: props.row.uuid } });
      dispatch(showSuccess(translate('Payment profile has been removed.')));
      dispatch(closeModalDialog());
      await props.refetch();
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to remove payment profile.'),
        ),
      );
    }
  };
  return (
    <ActionItem
      title={translate('Delete')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
