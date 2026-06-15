import { FunctionComponent, useMemo } from 'react';
import { userInvitationsList } from 'waldur-js-client';

import { CustomerPermissionsLogButton } from '@/customer/team/CustomerPermissionsLogButton';
import { useTeamTableTabs } from '@/customer/team/tabs';
import { TeamDropdownActions } from '@/customer/team/TeamDropdownActions';
import { translate } from '@/i18n';
import { InvitationExpandableRow } from '@/invitations/InvitationExpandableRow';
import { useTitle } from '@/navigation/title';
import { createFetcher } from '@/table/api';
import {
  selectUserInvitationsFilter,
  UserInvitationsFilter,
  UserInvitationsFilterFormId,
} from '@/table/generated/UserInvitationsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { getInvitationColumns } from './columns';
import { InvitationActions } from './InvitationActions';
import { InvitationsMultiSelectActions } from './InvitationsMultiSelectActions';

export const InvitationsList: FunctionComponent = () => {
  useTitle(translate('Invitations'));
  const customer = useCustomer();
  const values = useFilterValues('user-invitations');

  const stateFilter = useMemo(
    () => selectUserInvitationsFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({ ...stateFilter, customer_uuid: customer.uuid }),
    [stateFilter, customer],
  );
  const props = useTable({
    table: 'user-invitations',
    syncFiltersToURL: true,
    fetchData: createFetcher(userInvitationsList),
    filter,
    queryField: 'email',
  });

  const tableTabs = useTeamTableTabs();

  return (
    <Table
      {...props}
      filters={<UserInvitationsFilter />}
      columns={getInvitationColumns()}
      tabs={tableTabs}
      title={translate('Team')}
      verboseName={translate('team invitations')}
      hasQuery={true}
      tableActions={<TeamDropdownActions refetch={props.fetch} />}
      dropdownActions={<CustomerPermissionsLogButton />}
      dropdownActionsSize="lg"
      enableExport
      showExportInDropdown
      rowActions={({ row }) => (
        <InvitationActions invitation={row} refetch={props.fetch} />
      )}
      expandableRow={InvitationExpandableRow}
      enableMultiSelect
      multiSelectActions={InvitationsMultiSelectActions}
      formId={UserInvitationsFilterFormId}
    />
  );
};
