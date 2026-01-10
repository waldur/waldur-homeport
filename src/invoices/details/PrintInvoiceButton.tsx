import { PrinterIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/core/config';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const PrintInvoiceButton: FunctionComponent = () => (
  <SubmitButton
    submitting={false}
    type="button"
    variant="secondary"
    onClick={() => window.print()}
    label={
      ENV.accountingMode === 'accounting'
        ? translate('Print record')
        : translate('Print invoice')
    }
    iconNode={<PrinterIcon weight="bold" />}
    iconOnLeft
  />
);
