import { PrinterIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

export const ExportOrderComponentsButton: FunctionComponent = () => (
  <BaseButton
    variant="tertiary"
    onClick={() => window.print()}
    iconNode={<PrinterIcon weight="bold" />}
    label={translate('Print PDF')}
    size="lg"
  />
);
