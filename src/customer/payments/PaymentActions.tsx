import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { DeletePaymentButton } from './DeletePaymentButton';
import { EditPaymentButton } from './EditPaymentButton';
import { LinkInvoiceAction } from './LinkInvoiceAction';
import { UnlinkInvoiceButton } from './UnlinkInvoiceButton';

export const PaymentActions: FunctionComponent<{ payment }> = ({ payment }) => (
  <ButtonGroup>
    <EditPaymentButton payment={payment} />
    <DeletePaymentButton payment={payment} />
    {!payment.invoice ? (
      <LinkInvoiceAction payment={payment} />
    ) : (
      <UnlinkInvoiceButton payment={payment} />
    )}
  </ButtonGroup>
);
