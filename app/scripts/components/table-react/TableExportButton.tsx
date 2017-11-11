import React from 'react';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { TranslateProps } from './types';

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
      label: translate('Print'),
      format: 'print',
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
      label: translate('XSLX'),
      format: 'xsls',
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
