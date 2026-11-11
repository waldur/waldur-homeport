import { PrinterIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { isAccountingMode } from '@/invoices/accountingMode';

export const PrintInvoiceButton: FunctionComponent = () => (
  <BaseButton
    variant="secondary"
    onClick={() => window.print()}
    label={
      isAccountingMode()
        ? translate('Print record')
        : translate('Print invoice')
    }
    iconNode={<PrinterIcon weight="bold" />}
    size="lg"
  />
);
