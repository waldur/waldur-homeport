import { Export } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { TableProps } from './Table';

interface TableExportButtonProps {
  openExportDialog?: TableProps['openExportDialog'];
}

export const TableExportButton: FunctionComponent<TableExportButtonProps> = ({
  openExportDialog,
  ...props
}) => {
  return (
    <Button
      variant="light"
      onClick={() => openExportDialog('clipboard', props)}
    >
      <span className="svg-icon svg-icon-2">
        <Export />
      </span>
      {translate('Export')}
    </Button>
  );
};
