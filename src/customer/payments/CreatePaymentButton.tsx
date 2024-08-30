import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

const PaymentCreateDialogContainer = lazyComponent(
  () => import('@waldur/customer/payments/PaymentCreateDialog'),
  'PaymentCreateDialogContainer',
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
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
