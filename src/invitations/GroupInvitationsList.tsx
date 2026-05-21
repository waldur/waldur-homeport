import {
  CheckIcon,
  GlobeSimpleIcon,
  LockIcon,
  XIcon,
} from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { useSelector } from 'react-redux';
import { GroupInvitation, userGroupInvitationsList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { CustomerPermissionsLogButton } from '@/customer/team/CustomerPermissionsLogButton';
import { TeamDropdownActions } from '@/customer/team/TeamDropdownActions';
import { translate } from '@/i18n';
import { GroupInvitationRowActions } from '@/invitations/GroupInvitationRowActions';
import { GroupInvitationsListExpandableRow } from '@/invitations/GroupInvitationsListExpandableRow';
import { createFetcher } from '@/table/api';
import {
  UserGroupInvitationsFilter,
  UserGroupInvitationsFilterFormId,
  selectUserGroupInvitationsFilter,
} from '@/table/generated/UserGroupInvitationsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { RoleField } from '@/user/affiliations/RoleField';
import { exportRoleField } from '@/user/affiliations/RolePopover';
import { getCustomer } from '@/workspace/selectors';

import { useTeamTableTabs } from '../customer/team/tabs';

const GroupInvitationsListTable: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const { values } = useFormState();
  const filterValues = useMemo(
    () => selectUserGroupInvitationsFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({
      ...filterValues,
      customer_uuid: customer?.uuid,
    }),
    [filterValues, customer],
  );

  const props = useTable({
    table: 'group-invitations',
    fetchData: createFetcher(userGroupInvitationsList),
    filter,
  });

  const tableTabs = useTeamTableTabs();

  return (
    <Table<GroupInvitation>
      {...props}
      formId={UserGroupInvitationsFilterFormId}
      filters={<UserGroupInvitationsFilter />}
      filterPosition="menu"
      hasQuery
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
          title: translate('Type'),
          render: ({ row }) =>
            row.is_public ? (
              <Badge
                variant="blue"
                leftIcon={<GlobeSimpleIcon weight="bold" />}
                pill
                outline
              >
                {translate('Public')}
              </Badge>
            ) : (
              <Badge
                variant="default"
                leftIcon={<LockIcon weight="bold" />}
                pill
                outline
              >
                {translate('Private')}
              </Badge>
            ),
          export: (row) =>
            row.is_public ? translate('Public') : translate('Private'),
        },
        {
          title: translate('Status'),
          render: ({ row }) =>
            row.is_active ? (
              <Badge
                variant="success"
                leftIcon={<CheckIcon weight="bold" />}
                pill
                outline
              >
                {translate('Active')}
              </Badge>
            ) : (
              <Badge
                variant="default"
                leftIcon={<XIcon weight="bold" />}
                pill
                outline
              >
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
      tableActions={<TeamDropdownActions refetch={props.fetch} />}
      dropdownActions={<CustomerPermissionsLogButton />}
      enableExport
      showExportInDropdown
      rowActions={({ row }) => (
        <GroupInvitationRowActions row={row} refetch={props.fetch} />
      )}
      expandableRow={GroupInvitationsListExpandableRow}
      expandableRowClassName="pb-2 pe-2"
    />
  );
};

export const GroupInvitationsList: FunctionComponent<{}> = () => (
  <Form
    id={UserGroupInvitationsFilterFormId}
    onSubmit={() => {}}
    subscription={{ values: true }}
  >
    {() => <GroupInvitationsListTable />}
  </Form>
);
