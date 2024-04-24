import { useDispatch, useSelector } from 'react-redux';

import { unlinkInvoice } from '@waldur/customer/payments/store/actions';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const UnlinkInvoiceButton = ({ payment }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);

  return (
    <ActionButton
      title={translate('Unlink invoice')}
      action={() => dispatch(unlinkInvoice(payment.uuid))}
      icon="fa fa-file-text-o"
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
