import { render } from 'enzyme';
import * as React from 'react';

import { TableBody } from './TableBody';

export const ROW_UUID = 1;

export const COLUMNS = [
  {
    title: 'Resource type',
    render: ({ row }) => row.type,
  },
  {
    title: 'Resource name',
    render: ({ row }) => row.name,
  },
];

const ROWS = [
  {
    type: 'OpenStack Instance',
    name: 'Web server',
    uuid: ROW_UUID,
  },
];

export const renderWrapper = (props?) =>
  render(<TableBody columns={COLUMNS} rows={ROWS} {...props} />);
