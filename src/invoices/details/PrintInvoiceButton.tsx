import { PrinterIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';

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
