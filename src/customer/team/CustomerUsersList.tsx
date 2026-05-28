import { useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  CustomersUsersListData,
  CustomerUser,
  customersUsersList,
} from 'waldur-js-client';

import { CustomerUsersListExpandableRow } from '@/customer/team/CustomerUsersListExpandableRow';
import { useTeamTableTabs } from '@/customer/team/tabs';
import { getCustomerRoles, getProjectRoles } from '@/permissions/utils';
import { createFetcher } from '@/table/api';
import {
  CustomersUsersFilter,
  selectCustomersUsersFilter,
  CustomersUsersFilterFormId,
} from '@/table/generated/CustomersUsersFilter';
import { useTable } from '@/table/useTable';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { CustomerPermissionsLogButton } from './CustomerPermissionsLogButton';
import { CustomerUserRowActions } from './CustomerUserRowActions';
import { TeamDropdownActions } from './TeamDropdownActions';
import { TeamTableComponent } from './TeamTableComponent';
import { UsersBulkRemoveButton } from './UsersBulkRemoveButton';

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

const CustomerUsersListTable: FunctionComponent = () => {
  const { values } = useFormState();
  const filter = useMemo(() => selectCustomersUsersFilter(values), [values]);
  const customer = useCustomer();
  const props = useTable({
    table: 'customer-users',
    fetchData: createFetcher(customersUsersList, {
      path: {
        customer_uuid: customer.uuid,
      } satisfies CustomersUsersListData['path'],
    }),
    queryField: 'user_keyword',
    filter,
    mandatoryFields,
  });

  // The "Team" page contains several other pages. We have to check the access permissions to this page here.
  const router = useRouter();
  const user = useUser();
  const isOwnerOrStaff = useMemo(
    () => checkIsOwnerOrStaff(customer, user),
    [customer, user],
  );
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
      filters={
        <CustomersUsersFilter
          projectRoles={getProjectRoles()}
          organizationRoles={getCustomerRoles()}
        />
      }
    />
  );
};

export const CustomerUsersList = (props) => (
  <Form
    id={CustomersUsersFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <CustomerUsersListTable {...props} />}
  </Form>
);
