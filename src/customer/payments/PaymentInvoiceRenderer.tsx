import { FunctionComponent } from 'react';
import { Payment } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { DASH_ESCAPE_CODE } from '@/table/constants';

export const PaymentInvoiceRenderer: FunctionComponent<{ row: Payment }> = ({
  row,
}) =>
  row.invoice_uuid && row.invoice_period ? (
    <Link
      state="billingDetails"
      params={{ uuid: row.customer_uuid, invoice_uuid: row.invoice_uuid }}
    >
      {row.invoice_period}
    </Link>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
