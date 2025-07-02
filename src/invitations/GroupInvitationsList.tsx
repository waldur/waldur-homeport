import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { GroupInvitation } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { CustomerPermissionsLogButton } from '@waldur/customer/team/CustomerPermissionsLogButton';
import { TeamDropdownActions } from '@waldur/customer/team/TeamDropdownActions';
import { translate } from '@waldur/i18n';
import { GROUP_INVITATIONS_FILTER_FORM_ID } from '@waldur/invitations/constants';
import { GroupInvitationRowActions } from '@waldur/invitations/GroupInvitationRowActions';
import { GroupInvitationsFilter } from '@waldur/invitations/GroupInvitationsFilter';
import { GroupInvitationsListExpandableRow } from '@waldur/invitations/GroupInvitationsListExpandableRow';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { exportRoleField } from '@waldur/user/affiliations/RolePopover';
import { getCustomer } from '@waldur/workspace/selectors';

import { useTeamTableTabs } from '../customer/team/tabs';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues(GROUP_INVITATIONS_FILTER_FORM_ID),
  (customer, filterValues) => ({
    ...filterValues,
    customer_uuid: customer.uuid,
  }),
);

export const GroupInvitationsList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'group-invitations',
    fetchData: createFetcher('user-group-invitations'),
    filter,
  });

  const tableTabs = useTeamTableTabs();

  return (
    <Table<GroupInvitation>
      {...props}
      filters={<GroupInvitationsFilter />}
      columns={[
        {
          title: translate('Created by'),
          render: ({ row }) => row.created_by_full_name,
          export: (row) => row.created_by_full_name,
          className: 'text-dark',
        },
        {
          title: translate('Role'),
          render: RoleField,
          export: exportRoleField,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => formatDateTime(row.created),
          export: (row) => formatDateTime(row.created),
        },
        {
          title: translate('Expires at'),
          render: ({ row }) => formatDateTime(row.expires),
          export: (row) => formatDateTime(row.expires),
        },
        {
          title: translate('Status'),
          render: ({ row }) =>
            row.is_active ? (
              <Badge variant="success" leftIcon={<CheckIcon />} outline pill>
                {translate('Active')}
              </Badge>
            ) : (
              <Badge variant="default" leftIcon={<XIcon />} outline pill>
                {translate('Inactive')}
              </Badge>
            ),

          filter: 'is_active',
          export: (row) => (row.is_active ? translate('Yes') : translate('No')),
        },
      ]}
      tabs={tableTabs}
      title={translate('Team')}
      verboseName={translate('group invitations')}
      tableActions={
        <>
          <CustomerPermissionsLogButton />
          <TeamDropdownActions refetch={props.fetch} />
        </>
      }
      rowActions={({ row }) => (
        <GroupInvitationRowActions row={row} refetch={props.fetch} />
      )}
      expandableRow={GroupInvitationsListExpandableRow}
      expandableRowClassName="pb-2 pe-2"
      enableExport
    />
  );
};
