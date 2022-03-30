import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const PrintInvoiceButton: FunctionComponent = () => (
  <Button size="sm" onClick={() => window.print()}>
    <i className="fa fa-print" />{' '}
    {ENV.accountingMode === 'accounting'
      ? translate('Print record')
      : translate('Print invoice')}
  </Button>
);
