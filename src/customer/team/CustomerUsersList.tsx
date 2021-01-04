import { FunctionComponent, useMemo } from 'react';
import Gravatar from 'react-gravatar';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { CUSTOMER_USERS_LIST_FILTER_FORM_ID } from '@waldur/customer/team/constants';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { CustomerRole } from '@waldur/user/list/CustomerRole';
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
import { getRoles } from './utils';

const UserProjectRolesList = ({ row }) => {
  const roles = useMemo(getRoles, []);
  return (
    <>
      {roles.map((role) => (
        <p key={role.value}>
          <b>{translate('{label} in:', role)}</b>{' '}
          <ProjectRolesList roleName={role.value} row={row} />
        </p>
      ))}
    </>
  );
};

const TableComponent: FunctionComponent<any> = (props) => {
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
          render: CustomerRole,
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
      expandableRow={UserProjectRolesList}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string | boolean> = {
    customer_uuid: props.customer.uuid,
    o: 'concatenated_name',
  };
  if (props.filter) {
    if (props.filter.project_role) {
      filter.project_role = props.filter.project_role.map(({ value }) => value);
    }
    if (props.filter.organization_role) {
      filter.organization_role = props.filter.organization_role.map(
        ({ value }) => value,
      );
    }
  }
  return filter;
};

const TableOptions: TableOptionsType = {
  table: 'customer-users',
  fetchData: fetchCustomerUsers,
  queryField: 'full_name',
  mapPropsToFilter,
};

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
  user: getUser(state),
  isOwnerOrStaff: isOwnerOrStaffSelector(state),
  customer: getCustomer(state),
  filter: getFormValues(CUSTOMER_USERS_LIST_FILTER_FORM_ID)(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const CustomerUsersList = enhance(TableComponent);
