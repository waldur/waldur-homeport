import { paymentsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

import { PAYMENTS_TABLE } from '../details/constants';

export const DeletePaymentButton = ({ row: payment }) => {
  const user = useUser();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => paymentsDestroy({ path: { uuid: payment.uuid } }),
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete the payment?'),
      options: { forDeletion: true },
    },
    successMessage: translate('Payment has been deleted.'),
    errorMessage: translate('Unable to delete payment.'),
    invalidateQueries: [{ queryKey: ['table', PAYMENTS_TABLE] }],
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
