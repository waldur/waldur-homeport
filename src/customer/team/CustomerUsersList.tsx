import { useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { CustomersUsersListData, CustomerUser } from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { ENV } from '@waldur/core/config';
import { formatDate } from '@waldur/core/dateUtils';
import { CUSTOMER_USERS_LIST_FILTER_FORM_ID } from '@waldur/customer/team/constants';
import { CustomerUsersListExpandableRow } from '@waldur/customer/team/CustomerUsersListExpandableRow';
import { useTeamTableTabs } from '@waldur/customer/team/tabs';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { exportRoleField } from '@waldur/user/affiliations/RolePopover';
import {
  getCustomer,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { CustomerPermissionsLogButton } from './CustomerPermissionsLogButton';
import { CustomerUserRowActions } from './CustomerUserRowActions';
import { TeamDropdownActions } from './TeamDropdownActions';
import { UsersBulkRemoveButton } from './UsersBulkRemoveButton';

export const renderRoleExpirationDate = (row) => {
  return row.expiration_time
    ? formatDate(row.expiration_time)
    : DASH_ESCAPE_CODE;
};

const mapStateToFilter = createSelector(
  getFormValues(CUSTOMER_USERS_LIST_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: CustomersUsersListData['query'] = {
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

const mandatoryFields: CustomersUsersListData['query']['field'] = [
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

  // The "Team" page contains several other pages. We have to check the access permissions to this page here.
  const router = useRouter();
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  useEffect(() => {
    if (!isOwnerOrStaff) {
      router.stateService.go('organization-invitations');
    }
  }, []);

  const tableTabs = useTeamTableTabs();

  return (
    <Table<CustomerUser>
      title={translate('Team')}
      {...props}
      filters={filters}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <div className="content-wrapper gap-2">
              <Avatar name={row.full_name} src={row.image} circle size={32} />
              <p className="mb-0">{row.full_name || DASH_ESCAPE_CODE}</p>
            </div>
          ),
          export: 'full_name',
          id: 'member',
          keys: ['full_name', 'username', 'image'],
          copyField: (row) => row.full_name,
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.email || DASH_ESCAPE_CODE,
          export: 'email',
          id: 'email',
          keys: ['email'],
          copyField: (row) => row.email,
        },
        {
          title: translate('Username'),
          render: ({ row }) => row.username,
          export: 'username',
          id: 'username',
          keys: ['username'],
          optional: !isFeatureVisible(UserFeatures.show_username),
          copyField: (row) => row.username,
        },
        {
          title: translate('Role in organization'),
          render: RoleField,
          className: 'w-25',
          filter: 'organization_role',
          inlineFilter: (row) =>
            ENV.roles.filter((role) => role.name === row.role_name),
          export: exportRoleField,
          id: 'role_name',
          keys: ['role_name'],
        },
        {
          title: translate('Role expiration'),
          render: ({ row }) => renderRoleExpirationDate(row),
          className: 'w-45px',
          export: (row) => renderRoleExpirationDate(row),
          id: 'expiration_time',
          keys: ['expiration_time'],
        },
      ]}
      tabs={tableTabs}
      verboseName={translate('team members')}
      hasQuery={true}
      enableExport
      rowActions={({ row }) => (
        <CustomerUserRowActions row={row} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => (
        <CustomerUsersListExpandableRow row={row} refetch={props.fetch} />
      )}
      tableActions={
        <>
          <CustomerPermissionsLogButton />
          <TeamDropdownActions refetch={props.fetch} />
        </>
      }
      hasOptionalColumns
      enableMultiSelect
      multiSelectActions={UsersBulkRemoveButton}
    />
  );
};
