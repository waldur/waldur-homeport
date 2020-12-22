import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const PrintInvoiceButton: FunctionComponent = () => (
  <button className="btn btn-primary" onClick={() => window.print()}>
    <i className="fa fa-print" />{' '}
    {ENV.accountingMode === 'accounting'
      ? translate('Print record')
      : translate('Print invoice')}
  </button>
);
