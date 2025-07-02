import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getUser } from '@waldur/workspace/selectors';

const PaymentUpdateDialogContainer = lazyComponent(() =>
  import('@waldur/customer/payments/PaymentUpdateDialog').then((module) => ({
    default: module.PaymentUpdateDialogContainer,
  })),
);

export const EditPaymentButton = ({ row: payment }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  return (
    <ActionItem
      title={translate('Edit')}
      action={() =>
        dispatch(
          openModalDialog(PaymentUpdateDialogContainer, {
            resolve: payment,
            size: 'lg',
          }),
        )
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
