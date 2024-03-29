import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface TableExportButtonProps {
  exportAs?: (format: string) => void;
}

export const TableExportButton: FunctionComponent<TableExportButtonProps> = ({
  exportAs,
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle className="ms-3" variant="light">
        <i className="fa fa-download" />
        {translate('Export')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => exportAs('clipboard')}>
          {translate('Copy to clipboard')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => exportAs('csv')}>CSV</Dropdown.Item>
        <Dropdown.Item onClick={() => exportAs('pdf')}>PDF</Dropdown.Item>
        <Dropdown.Item onClick={() => exportAs('excel')}>Excel</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
