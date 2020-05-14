import * as React from 'react';
import * as Gravatar from 'react-gravatar';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { translate } from '@waldur/i18n';
import { Table, connectTable } from '@waldur/table-react';
import { BooleanField } from '@waldur/table-react/BooleanField';
import { TableOptionsType } from '@waldur/table-react/types';
import {
  getProject,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

import { fetchCustomerUsers } from './api';
import { ProjectRolesList } from './ProjectRolesList';
import { UserDetailsButton } from './UserDetailsButton';
import { UserEditButton } from './UserEditButton';
import { UserRemoveButton } from './UserRemoveButton';

const TableComponent = props => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <>
              <Gravatar email={row.email} size={25} />{' '}
              {row.full_name || row.username}
            </>
          ),
        },
        {
          title: translate('E-mail'),
          render: ({ row }) => row.email || 'N/A',
        },
        {
          title: translate('Owner'),
          render: ({ row }) => <BooleanField value={row.role === 'owner'} />,
        },
        {
          title: translate('Manager in:'),
          render: ({ row }) => (
            <ProjectRolesList roleName="manager" row={row} />
          ),
        },
        {
          title: translate('Admin in:'),
          render: ({ row }) => <ProjectRolesList roleName="admin" row={row} />,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <>
              {props.isOwnerOrStaff || props.user.is_support ? (
                <UserDetailsButton user={row} />
              ) : null}
              {props.isOwnerOrStaff ? <UserEditButton editUser={row} /> : null}
              {props.isOwnerOrStaff ? <UserRemoveButton user={row} /> : null}
            </>
          ),
        },
      ]}
      verboseName={translate('team members')}
      hasQuery={true}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'customer-users',
  fetchData: fetchCustomerUsers,
  queryField: 'full_name',
  mapPropsToFilter: props => ({
    customer_uuid: props.customer.uuid,
    o: 'concatenated_name',
  }),
};

const mapStateToProps = state => ({
  project: getProject(state),
  user: getUser(state),
  isOwnerOrStaff: isOwnerOrStaffSelector(state),
  customer: getCustomer(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const CustomerUsersList = enhance(TableComponent);
