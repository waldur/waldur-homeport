import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { removePaymentProfile } from '@waldur/customer/payment-profiles/store/actions';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

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
    <RowActionButton
      title={translate('Delete')}
      action={openDialog}
      iconNode={<Trash />}
      size="sm"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
