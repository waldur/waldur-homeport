import { shallow } from 'enzyme';

import { TableHeader } from './TableHeader';

const FullNameField = ({ row }) => <>{row.full_name}</>;

const EmailField = ({ row }) => <>{row.email}</>;

const PhoneNumberField = ({ row }) => <>{row.phone_number}</>;

export const renderWrapper = (columns, currentSorting?, expandableRow?) =>
  shallow(
    <TableHeader
      columns={columns}
      currentSorting={currentSorting}
      expandableRow={expandableRow}
    />,
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
