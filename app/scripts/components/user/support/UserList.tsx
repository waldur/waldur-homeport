import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import BooleanField from '@waldur/table-react/BooleanField';
import { Table, connectTable, createFetcher } from '@waldur/table-react/index';

import { UserDetailsButton } from './UserDetailsButton';

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

const formatRoleFilter = filter => {
  if (filter && filter.role) {
    const formatedRole = {};
    filter.role.map(item => {
      formatedRole[item.value] = true;
    });
    const { status, ...rest } = filter;
    return {
      ...rest,
      ...formatedRole,
    };
  }
  return filter;
};

const TableOptions = {
  table: 'userList',
  fetchData: createFetcher('users'),
  mapPropsToFilter: props => formatRoleFilter(props.userFilter),
  exportFields: ['username', 'email'],
  exportRow: row => [row.username, row.email],
};

const mapStateToProps = state => ({
  userFilter: getFormValues('userFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const UserList = enhance(TableComponent);
