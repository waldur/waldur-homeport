import * as React from 'react';
import * as Dropdown from 'react-bootstrap/lib/Dropdown';

import { translate } from '@waldur/i18n';

interface Props {
  exportAs?: (format: string) => void;
}

export const TableExportButton = ({ exportAs }: Props) => {
  const exporters = [
    {
      label: translate('Copy to clipboard'),
      format: 'clipboard',
    },
    {
      label: translate('CSV'),
      format: 'csv',
    },
    {
      label: translate('PDF'),
      format: 'pdf',
    },
    {
      label: translate('Excel'),
      format: 'excel',
    },
  ];

  return (
    <Dropdown id="export-button">
      <Dropdown.Toggle className="btn-sm">
        <i className="fa fa-download" />
        &nbsp;
        {translate('Export as')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {exporters.map(({ label, format }) => (
          <li role="presentation" key={format} onClick={() => exportAs(format)}>
            <a role="menuitem" tabIndex={-1}>
              {label}
            </a>
          </li>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
