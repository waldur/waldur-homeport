import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const PaymentUpdateDialog = lazyComponent(() =>
  import('@/customer/payments/PaymentUpdateDialog').then((module) => ({
    default: module.PaymentUpdateDialog,
  })),
);

export const EditPaymentButton = ({ row: payment, refetch }) => {
  const { openDialog } = useModal();
  const user = useUser();
  return (
    <ActionItem
      title={translate('Edit')}
      action={() =>
        openDialog(PaymentUpdateDialog, {
          resolve: { ...payment, refetch },
          size: 'lg',
        })
      }
      iconNode={<PencilSimpleIcon weight="bold" />}
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
