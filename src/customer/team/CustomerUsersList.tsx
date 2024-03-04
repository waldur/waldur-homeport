import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import Avatar from '@waldur/core/Avatar';
import { formatDate } from '@waldur/core/dateUtils';
import { CUSTOMER_USERS_LIST_FILTER_FORM_ID } from '@waldur/customer/team/constants';
import { CustomerUsersListExpandableRow } from '@waldur/customer/team/CustomerUsersListExpandableRow';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { TableOptionsType } from '@waldur/table/types';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { getCustomer } from '@waldur/workspace/selectors';

import { fetchCustomerUsers } from './api';
import { CustomerUserRowActions } from './CustomerUserRowActions';
import { UserAddButton } from './UserAddButton';

export const renderRoleExpirationDate = (row) => {
  return row.expiration_time
    ? formatDate(row.expiration_time)
    : DASH_ESCAPE_CODE;
};

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
                <Avatar
                  className="symbol symbol-25px"
                  name={row.full_name}
                  size={25}
                />
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
          title: translate('Role in organization'),
          render: RoleField,
        },
        {
          title: translate('Role expiration'),
          render: ({ row }) => renderRoleExpirationDate(row),
        },
      ]}
      verboseName={translate('team members')}
      hasQuery={true}
      hoverableRow={({ row }) => (
        <CustomerUserRowActions row={row} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => (
        <CustomerUsersListExpandableRow row={row} refetch={props.fetch} />
      )}
      actions={<UserAddButton refetch={props.fetch} />}
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
  queryField: 'full_name_and_email',
  mapPropsToFilter,
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  filter: getFormValues(CUSTOMER_USERS_LIST_FILTER_FORM_ID)(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const CustomerUsersList = enhance(
  TableComponent,
) as React.ComponentType<any>;
