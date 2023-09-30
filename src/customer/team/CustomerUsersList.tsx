import { FunctionComponent } from 'react';
import Gravatar from 'react-gravatar';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { CUSTOMER_USERS_LIST_FILTER_FORM_ID } from '@waldur/customer/team/constants';
import { CustomerUsersListExpandableRow } from '@waldur/customer/team/CustomerUsersListExpandableRow';
import { translate } from '@waldur/i18n';
import { RoleEnum } from '@waldur/permissions/enums';
import { formatRole } from '@waldur/permissions/utils';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { CustomerRole } from '@waldur/user/dashboard/CustomerRole';
import {
  getProject,
  isStaff as isStaffSelector,
  getCustomer,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { fetchCustomerUsers } from './api';
import { CustomerUserAddButton } from './CustomerUserAddButton';
import { CustomerUserRowActions } from './CustomerUserRowActions';
import { ProjectMemberAddButton } from './ProjectMemberAddButton';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      title={translate('Team members')}
      {...props}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <div className="content-wrapper gap-2">
              {row.image ? (
                <img
                  src={row.image}
                  alt={row.username}
                  width={25}
                  height={25}
                />
              ) : (
                <Gravatar email={row.email} size={25} />
              )}
              <p className="mb-0">{row.full_name || row.username}</p>
            </div>
          ),
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.email || 'N/A',
        },
        {
          title: formatRole(RoleEnum.CUSTOMER_OWNER),
          render: CustomerRole,
        },
      ]}
      verboseName={translate('team members')}
      hasQuery={true}
      hoverableRow={({ row }) => (
        <CustomerUserRowActions row={row} refetch={props.fetch} />
      )}
      expandableRow={CustomerUsersListExpandableRow}
      actions={
        <>
          {props.isStaff ? (
            <CustomerUserAddButton refetch={props.fetch} />
          ) : null}
          {props.isOwnerOrStaff ? (
            <ProjectMemberAddButton refetch={props.fetch} />
          ) : null}
        </>
      }
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
  isStaff: isStaffSelector(state),
  isOwnerOrStaff: isOwnerOrStaffSelector(state),
  customer: getCustomer(state),
  filter: getFormValues(CUSTOMER_USERS_LIST_FILTER_FORM_ID)(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const CustomerUsersList = enhance(
  TableComponent,
) as React.ComponentType<any>;
