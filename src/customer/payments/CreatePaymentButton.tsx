import { FunctionComponent } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const PaymentCreateDialog = lazyComponent(() =>
  import('@/customer/payments/PaymentCreateDialog').then((module) => ({
    default: module.PaymentCreateDialog,
  })),
);

export const CreatePaymentButton: FunctionComponent<{
  activePaymentProfile: { url?: string };
  refetch: () => void;
}> = ({ activePaymentProfile, refetch }) => {
  const { openDialog } = useModal();
  const user = useUser();
  const action = () =>
    openDialog(PaymentCreateDialog, {
      resolve: {
        profileUrl: activePaymentProfile.url,
        refetch,
      },
      size: 'lg',
    });
  return (
    <AddButton
      action={action}
      disabled={!user?.is_staff}
      tooltip={
        !user?.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
