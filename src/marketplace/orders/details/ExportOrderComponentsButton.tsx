import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const ExportOrderComponentsButton: FunctionComponent = () => (
  <Button variant="secondary" onClick={() => window.print()}>
    <span className="svg-icon svg-icon-2">
      <DownloadSimpleIcon weight="bold" />
    </span>{' '}
    {translate('Export as PDF')}
  </Button>
);
