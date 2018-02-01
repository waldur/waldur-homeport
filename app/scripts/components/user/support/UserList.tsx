import * as React from 'react';

import BooleanField from '@waldur/table-react/BooleanField';
import { Table, connectTable, createFetcher } from '@waldur/table-react/index';

import UserDetailsButton from './UserDetailsButton';

const PhoneNumberField = ({ row }) => (
  <span>{row.phone_number}</span>
);

const EmailField = ({ row }) => (
  <span>{row.email}</span>
);

const FullNameField = ({ row }) => (
  <span>{row.full_name}</span>
);

const StaffStatusField: any = ({ row }) => {
  return <BooleanField value={row.is_staff}/>;
};

const SupportStatusField = ({ row }) => {
  return <BooleanField value={row.is_support}/>;
};

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table {...props} columns={[
      {
        title: translate('Full name'),
        render: FullNameField,
      },
      {
        title: translate('Email'),
        render: EmailField,
      },
      {
        title: translate('Phone number'),
        render: PhoneNumberField,
      },
      {
        title: translate('Staff'),
        render: StaffStatusField,
        className: 'text-center',
      },
      {
        title: translate('Support'),
        render: SupportStatusField,
        className: 'text-center',
      },
      {
        title: translate('Actions'),
        render: UserDetailsButton,
        className: 'text-center col-md-2',
      },
    ]}
    hasQuery={false}
    verboseName={translate('users')}/>
  );
};

const mapPropsToFilter = props => {
  return props.userFilter;
};

const TableOptions = {
  table: 'userList',
  fetchData: createFetcher('users'),
  mapPropsToFilter,
  exportFields: ['username', 'email'],
  exportRow: row => [row.username, row.email],
};

export default connectTable(TableOptions)(TableComponent);
