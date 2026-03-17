import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userInvitationsList } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { CustomerPermissionsLogButton } from '@waldur/customer/team/CustomerPermissionsLogButton';
import { useTeamTableTabs } from '@waldur/customer/team/tabs';
import { TeamDropdownActions } from '@waldur/customer/team/TeamDropdownActions';
import { translate } from '@waldur/i18n';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher } from '@waldur/table/api';
import {
  selectUserInvitationsFilter,
  UserInvitationsFilter,
} from '@waldur/table/generated/UserInvitationsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { exportRoleField } from '@waldur/user/affiliations/RolePopover';
import { getCustomer } from '@waldur/workspace/selectors';

import { formatInvitationState } from './choices';
import { InvitationActions } from './InvitationActions';
import { InvitationsMultiSelectActions } from './InvitationsMultiSelectActions';

export const InvitationsList: FunctionComponent = () => {
  useTitle(translate('Invitations'));
  const customer = useSelector(getCustomer);
  const stateFilter = useSelector(selectUserInvitationsFilter);
  const filter = useMemo(
    () => ({
      ...stateFilter,
      customer_uuid: customer.uuid,
    }),
    [stateFilter, customer],
  );
  const props = useTable({
    table: 'user-invitations',
    fetchData: createFetcher(userInvitationsList),
    filter,
    queryField: 'email',
  });

  const tableTabs = useTeamTableTabs();

  return (
    <Table
      {...props}
      filters={<UserInvitationsFilter />}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              {row.email}
              <CopyToClipboardButton value={row.email} />
            </div>
          ),

          orderField: 'email',
          export: (row) => row.email,
        },
        {
          title: translate('Role'),
          render: RoleField,
          export: exportRoleField,
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => formatInvitationState(row.state),
          filter: 'state',
          inlineFilter: (row) => [
            { value: row.state, label: formatInvitationState(row.state) },
          ],

          export: (row) => row.state,
        },
        {
          title: translate('Created at'),
          orderField: 'created',
          render: ({ row }) => formatDate(row.created),
          export: (row) => formatDate(row.created),
        },
        {
          title: translate('Invited by'),
          orderField: 'created_by',
          render: ({ row }) => row.created_by_full_name,
          export: (row) => row.created_by_full_name,
        },
        {
          title: translate('Expires at'),
          orderField: 'expires',
          render: ({ row }) => formatDate(row.expires),
          export: (row) => formatDate(row.expires),
        },
      ]}
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
    />
  );
};
