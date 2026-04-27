import { ActionsDropdown } from '@/table/ActionsDropdown';

import { DeletePaymentButton } from './DeletePaymentButton';
import { EditPaymentButton } from './EditPaymentButton';
import { LinkInvoiceAction } from './LinkInvoiceAction';
import { UnlinkInvoiceButton } from './UnlinkInvoiceButton';

export const PaymentActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        EditPaymentButton,
        DeletePaymentButton,
        !row.invoice ? LinkInvoiceAction : UnlinkInvoiceButton,
      ].filter(Boolean)}
    />
  );
};
