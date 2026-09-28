import { PrinterIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

export const PrintInvoiceButton: FunctionComponent = () => (
  <BaseButton
    variant="secondary"
    onClick={() => window.print()}
    label={
      ENV.accountingMode === 'accounting'
        ? translate('Print record')
        : translate('Print invoice')
    }
    iconNode={<PrinterIcon weight="bold" />}
    size="lg"
  />
);
