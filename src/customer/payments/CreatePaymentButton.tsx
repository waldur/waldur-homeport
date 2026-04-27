import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { getUser } from '@/workspace/selectors';

const PaymentCreateDialogContainer = lazyComponent(() =>
  import('@/customer/payments/PaymentCreateDialog').then((module) => ({
    default: module.PaymentCreateDialogContainer,
  })),
);

export const CreatePaymentButton = ({ activePaymentProfile }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const action = () =>
    dispatch(
      openModalDialog(PaymentCreateDialogContainer, {
        resolve: {
          profileUrl: activePaymentProfile.url,
        },
        size: 'lg',
      }),
    );
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
