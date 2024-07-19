import { Export } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { TableProps } from './Table';

interface TableExportButtonProps {
  openExportDialog?: TableProps['openExportDialog'];
  rows?;
}

export const TableExportButton: FunctionComponent<TableExportButtonProps> = ({
  openExportDialog,
  ...props
}) => {
  return (
    <Button
      variant="outline-default"
      className="btn-outline"
      onClick={() => openExportDialog('clipboard', props)}
      disabled={props.rows?.length === 0}
    >
      <span className="svg-icon svg-icon-1">
        <Export weight="bold" />
      </span>
      {translate('Export')}
    </Button>
  );
};
