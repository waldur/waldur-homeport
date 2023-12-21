import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { TableProps } from './Table';

interface TableExportButtonProps {
  openExportDialog?: TableProps['openExportDialog'];
}

export const TableExportButton: FunctionComponent<TableExportButtonProps> = ({
  openExportDialog,
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle className="ms-3" variant="light">
        <i className="fa fa-download" />
        {translate('Export')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => openExportDialog('clipboard')}>
          {translate('Copy to clipboard')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => openExportDialog('csv')}>
          CSV
        </Dropdown.Item>
        <Dropdown.Item onClick={() => openExportDialog('pdf')}>
          PDF
        </Dropdown.Item>
        <Dropdown.Item onClick={() => openExportDialog('excel')}>
          Excel
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
