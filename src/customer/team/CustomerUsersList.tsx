import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import Avatar from '@waldur/core/Avatar';
import { formatDate } from '@waldur/core/dateUtils';
import { CUSTOMER_USERS_LIST_FILTER_FORM_ID } from '@waldur/customer/team/constants';
import { CustomerUsersListExpandableRow } from '@waldur/customer/team/CustomerUsersListExpandableRow';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { exportRoleField } from '@waldur/user/affiliations/RolePopover';
import { getCustomer } from '@waldur/workspace/selectors';

import { CustomerUserRowActions } from './CustomerUserRowActions';
import { UserAddButton } from './UserAddButton';

export const renderRoleExpirationDate = (row) => {
  return row.expiration_time
    ? formatDate(row.expiration_time)
    : DASH_ESCAPE_CODE;
};

const mapStateToFilter = createSelector(
  getFormValues(CUSTOMER_USERS_LIST_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: Record<string, string | boolean> = {
      o: 'concatenated_name',
    };
    if (filterValues) {
      if (filterValues.project_role) {
        filter.project_role = filterValues.project_role.map(({ name }) => name);
      }
      if (filterValues.organization_role) {
        filter.organization_role = filterValues.organization_role.map(
          ({ name }) => name,
        );
      }
    }
    return filter;
  },
);

const mandatoryFields = [
  // Required for actions and expandable view
  'uuid',
  'email',
  'expiration_time',
  'full_name',
  'role_name',
  'username',
  'projects',
];

export const CustomerUsersList: FunctionComponent<{ filters? }> = ({
  filters,
}) => {
  const filter = useSelector(mapStateToFilter);
  const customer = useSelector(getCustomer);
  const props = useTable({
    table: 'customer-users',
    fetchData: createFetcher(`customers/${customer.uuid}/users`),
    queryField: 'user_keyword',
    filter,
    mandatoryFields,
  });
  return (
    <Table
      title={translate('Team members')}
      {...props}
      filters={filters}
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
              <p className="mb-0">{row.full_name || DASH_ESCAPE_CODE}</p>
            </div>
          ),
          export: 'full_name',
          id: 'member',
          keys: ['full_name', 'username', 'image'],
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.email || DASH_ESCAPE_CODE,
          export: 'email',
          id: 'email',
          keys: ['email'],
        },
        {
          title: translate('Username'),
          render: ({ row }) => row.username,
          export: 'username',
          id: 'username',
          keys: ['username'],
          optional: true,
        },
        {
          title: translate('Role in organization'),
          render: RoleField,
          filter: 'organization_role',
          export: exportRoleField,
          id: 'role_name',
          keys: ['role_name'],
        },
        {
          title: translate('Role expiration'),
          render: ({ row }) => renderRoleExpirationDate(row),
          export: (row) => renderRoleExpirationDate(row),
          id: 'expiration_time',
          keys: ['expiration_time'],
        },
      ]}
      verboseName={translate('team members')}
      hasQuery={true}
      enableExport
      rowActions={({ row }) => (
        <CustomerUserRowActions row={row} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => (
        <CustomerUsersListExpandableRow row={row} refetch={props.fetch} />
      )}
      tableActions={<UserAddButton refetch={props.fetch} />}
      hasOptionalColumns
    />
  );
};
