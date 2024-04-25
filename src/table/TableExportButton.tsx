import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

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
    <Dropdown>
      <Dropdown.Toggle variant="light">
        <i className="fa fa-download" />
        {translate('Export')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => openExportDialog('clipboard', props)}>
          {translate('Copy to clipboard')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => openExportDialog('csv', props)}>
          CSV
        </Dropdown.Item>
        <Dropdown.Item onClick={() => openExportDialog('pdf', props)}>
          PDF
        </Dropdown.Item>
        <Dropdown.Item onClick={() => openExportDialog('excel', props)}>
          Excel
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
