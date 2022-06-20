import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import './ExportDropdown.scss';

export default function ExportDropdown({ exportAs }) {
  return (
    <Dropdown id="offering-actions" drop="start">
      <Dropdown.Toggle
        bsPrefix="p-0 bg-transparent w-100 text-start"
        variant="light"
      >
        <i className="fa fa-download" />
        {translate('Export')}
      </Dropdown.Toggle>
      <Dropdown.Menu align="start" className="export_dropdown shadow-sm">
        <Dropdown.Item onClick={() => exportAs('clipboard')}>
          {translate('Copy to clipboard')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => exportAs('csv')}>CSV</Dropdown.Item>
        <Dropdown.Item onClick={() => exportAs('pdf')}>PDF</Dropdown.Item>
        <Dropdown.Item onClick={() => exportAs('excel')}>Excel</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
