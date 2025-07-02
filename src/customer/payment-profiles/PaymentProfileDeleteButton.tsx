import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { paymentProfilesDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

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
