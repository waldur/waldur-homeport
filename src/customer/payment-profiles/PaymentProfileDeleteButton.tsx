import { useDispatch } from 'react-redux';

import { removePaymentProfile } from '@waldur/customer/payment-profiles/store/actions';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

export const PaymentProfileDeleteButton = (props) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the payment profile?'),
      );
    } catch {
      return;
    }
    dispatch(
      removePaymentProfile({
        uuid: props.profile.uuid,
        refetch: props.refetch,
      }),
    );
  };
  return (
    <ActionButton
      title={translate('Delete')}
      action={openDialog}
      icon="fa fa-trash"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
