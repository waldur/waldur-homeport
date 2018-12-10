import { shallow } from 'enzyme';
import * as React from 'react';

import { TableHeader } from './TableHeader';

const FullNameField = ({ row }) => (
  <span>{row.full_name}</span>
);

const EmailField = ({ row }) => (
  <span>{row.email}</span>
);

const PhoneNumberField = ({ row }) => (
  <span>{row.phone_number}</span>
);

export const renderWrapper = (columns, currentSorting?, expandableRow?) => shallow(
  <TableHeader
    columns={columns}
    currentSorting={currentSorting}
    expandableRow={expandableRow}
  />
);

export const ORDERED_COLUMNS = [
  {
    title: 'Full name',
    render: FullNameField,
  },
  {
    title: 'Email',
    render: EmailField,
    orderField: 'email',
  },
  {
    title: 'Phone number',
    render: PhoneNumberField,
    orderField: 'phone_number',
  },
];

export const UNORDERED_COLUMNS = [
  {
    title: 'Full name',
    render: FullNameField,
  },
  {
    title: 'Email',
    render: EmailField,
  },
  {
    title: 'Phone number',
    render: PhoneNumberField,
  },
];
