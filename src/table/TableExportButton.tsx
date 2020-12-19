import { FunctionComponent } from 'react';
import { Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface Props {
  exportAs?: (format: string) => void;
}

export const TableExportButton: FunctionComponent<Props> = ({ exportAs }) => {
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
      <DropdownToggle className="btn-sm">
        <i className="fa fa-download" />
        &nbsp;
        {translate('Export as')}
      </DropdownToggle>
      <DropdownMenu>
        {exporters.map(({ label, format }) => (
          <li role="presentation" key={format} onClick={() => exportAs(format)}>
            <a role="menuitem" tabIndex={-1}>
              {label}
            </a>
          </li>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
