import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const PrintInvoiceButton = () => (
  <button className="btn btn-primary" onClick={() => window.print()}>
    <i className="fa fa-print" />{' '}
    {ENV.accountingMode === 'accounting'
      ? translate('Print record')
      : translate('Print invoice')}
  </button>
);
