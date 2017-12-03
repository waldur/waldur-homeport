import * as React from 'react';
import * as Dropdown from 'react-bootstrap/lib/Dropdown';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';
import { TranslateProps } from '@waldur/i18n/types';

type Props = TranslateProps & {
  exportAs: Function,
};

const TableExportButton = ({ translate, exportAs }: Props) => {
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
    }
  ];

  return (
    <Dropdown id='export-button'>
      <Dropdown.Toggle className='btn-sm'>
        <i className='fa fa-download'/>&nbsp;
        {translate('Export as')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {exporters.map(({ label, format }) => (
          <MenuItem key={format} eventKey={format} onClick={() => exportAs(format)}>
            {label}
          </MenuItem>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TableExportButton;
