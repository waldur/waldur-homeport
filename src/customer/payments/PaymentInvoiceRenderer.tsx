import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const PaymentInvoiceRenderer = ({ row }) =>
  row.invoice_uuid && row.invoice_period ? (
    <Link state="billingDetails" params={{ uuid: row.invoice_uuid }}>
      {row.invoice_period}
    </Link>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
