import { PencilSimple } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const PaymentUpdateDialogContainer = lazyComponent(
  () => import('@waldur/customer/payments/PaymentUpdateDialog'),
  'PaymentUpdateDialogContainer',
);

export const EditPaymentButton = ({ payment }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  return (
    <ActionButton
      title={translate('Edit')}
      action={() =>
        dispatch(
          openModalDialog(PaymentUpdateDialogContainer, {
            resolve: payment,
            size: 'lg',
          }),
        )
      }
      iconNode={<PencilSimple />}
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
