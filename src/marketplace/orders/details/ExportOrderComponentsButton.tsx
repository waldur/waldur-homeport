import { PrinterIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

export const ExportOrderComponentsButton: FunctionComponent = () => (
  <ActionButton
    variant="tertiary"
    action={() => window.print()}
    iconNode={<PrinterIcon weight="bold" />}
    title={translate('Print PDF')}
  />
);
