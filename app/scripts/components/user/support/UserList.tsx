import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { Tooltip } from '@waldur/core/Tooltip';
import BooleanField from '@waldur/table-react/BooleanField';
import { Table, connectTable, createFetcher } from '@waldur/table-react/index';

import { UserDetailsButton } from './UserDetailsButton';

const renderFieldOrDash = field => {
  return field ? field : '\u2014';
};

const PhoneNumberField = ({ row }) => (
  <span>{renderFieldOrDash(row.phone_number)}</span>
);

const EmailField = ({ row }) => (
  <span>{renderFieldOrDash(row.email)}</span>
);

const FullNameField = ({ row }) => (
  <span>{renderFieldOrDash(row.full_name)}</span>
);

const OrganizationField = ({ row }) => (
  <span>{renderFieldOrDash(row.organization)}</span>
);

const StaffStatusField = ({ row }) => {
  return <BooleanField value={row.is_staff}/>;
};

const OrganizationRolesField = ({row}) => {
  if (row.customer_permissions && row.customer_permissions.length > 0) {
    return row.customer_permissions.map((permission, index) => {
      return (
        <span key={index}>
          <Tooltip key={index} label={permission.role} id="customer-role">
            {permission.customer_name}
            {' '}
            <i className="fa fa-question-circle"/>
          </Tooltip><br/>
        </span>
      );
    });
  } else {
    return '\u2014';
  }
};

const ProjectRolesField = ({row}) => {
  if (row.project_permissions && row.project_permissions.length > 0) {
    return row.project_permissions.map((permission, index) => {
      return (
        <span key={index}>
          <Tooltip key={index} label={permission.role} id="project-role">
            {permission.project_name}
            {' '}
            <i className="fa fa-question-circle"/>
          </Tooltip><br/>
        </span>
      );
    });
  } else {
    return '\u2014';
  }
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
        orderField: 'email',
      },
      {
        title: translate('Phone number'),
        render: PhoneNumberField,
        orderField: 'phone_number',
      },
      {
        title: translate('Organization'),
        render: OrganizationField,
      },
      {
        title: translate('Organization roles'),
        render: OrganizationRolesField,
      },
      {
        title: translate('Project roles'),
        render: ProjectRolesField,
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
    showPageSizeSelector={true}
    verboseName={translate('users')}/>
  );
};

export const formatRoleFilter = filter => {
  if (filter && filter.role) {
    const formattedRole = {};
    filter.role.map(item => {
      formattedRole[item.value] = true;
    });
    const { role, ...rest } = filter;
    return {
      ...rest,
      ...formattedRole,
    };
  }
  return filter;
};

const TableOptions = {
  table: 'userList',
  fetchData: createFetcher('users'),
  mapPropsToFilter: props => formatRoleFilter(props.userFilter),
  exportFields: [
    'Full name',
    'Username',
    'Email',
    'Phone number',
    'Organization',
    'Organizations owner',
  ],
  exportAll: true,
  exportRow: row => [
    row.full_name,
    row.username,
    row.email,
    row.phone_number,
    row.organization,
    getOrganizationsWhereOwner(row.customer_permissions),
  ],
};

export const getOrganizationsWhereOwner = permissions => {
  const customerNames = [];
  permissions.map(perm => {
    if (perm.role === 'owner') {
      customerNames.push(perm.customer_name);
    }
  });
  return customerNames.join(', ');
};

const mapStateToProps = state => ({
  userFilter: getFormValues('userFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const UserList = enhance(TableComponent);
