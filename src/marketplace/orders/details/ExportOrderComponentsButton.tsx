import { PrinterIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const ExportOrderComponentsButton: FunctionComponent = () => (
  <Button variant="tertiary" onClick={() => window.print()}>
    <span className="svg-icon svg-icon-2">
      <PrinterIcon weight="bold" />
    </span>
    {translate('Print PDF')}
  </Button>
);
