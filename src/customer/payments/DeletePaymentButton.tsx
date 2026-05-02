import { useDispatch, useSelector } from 'react-redux';
import { paymentsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

import { updatePaymentsList } from './utils';

export const DeletePaymentButton = ({ row: payment }) => {
  const dispatch = useDispatch();
  const user = useUser();
  const customer = useSelector(getCustomer);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => paymentsDestroy({ path: { uuid: payment.uuid } }),
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete the payment?'),
      options: { forDeletion: true },
    },
    successMessage: translate('Payment has been deleted.'),
    errorMessage: translate('Unable to delete payment.'),
    onSuccess: () => {
      dispatch(updatePaymentsList(customer));
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={!user.is_staff || isPending}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
