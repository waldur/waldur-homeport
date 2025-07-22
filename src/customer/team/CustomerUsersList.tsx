import { useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { CustomersUsersListData, CustomerUser } from 'waldur-js-client';

import { CUSTOMER_USERS_LIST_FILTER_FORM_ID } from '@waldur/customer/team/constants';
import { CustomerUsersListExpandableRow } from '@waldur/customer/team/CustomerUsersListExpandableRow';
import { useTeamTableTabs } from '@waldur/customer/team/tabs';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import {
  getCustomer,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { CustomerPermissionsLogButton } from './CustomerPermissionsLogButton';
import { CustomerUserRowActions } from './CustomerUserRowActions';
import { TeamDropdownActions } from './TeamDropdownActions';
import { TeamTableComponent } from './TeamTableComponent';
import { UsersBulkRemoveButton } from './UsersBulkRemoveButton';

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
    <TeamTableComponent<CustomerUser>
      {...props}
      context="organization"
      filters={filters}
      tabs={tableTabs}
      rowActions={({ row }) => (
        <CustomerUserRowActions row={row} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => (
        <CustomerUsersListExpandableRow row={row} refetch={props.fetch} />
      )}
      tableActions={<TeamDropdownActions refetch={props.fetch} />}
      dropdownActions={<CustomerPermissionsLogButton />}
      showExportInDropdown
      enableMultiSelect
      multiSelectActions={UsersBulkRemoveButton}
    />
  );
};
