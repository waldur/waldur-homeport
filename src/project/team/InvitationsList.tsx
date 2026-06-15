import { useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { Invitation, userInvitationsList } from 'waldur-js-client';

import Avatar from '@/core/Avatar';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { InvitationPolicyService } from '@/invitations/actions/InvitationPolicyService';
import { formatInvitationState } from '@/invitations/choices';
import { choices } from '@/invitations/choices';
import { InvitationActions } from '@/invitations/InvitationActions';
import { InvitationExpandableRow } from '@/invitations/InvitationExpandableRow';
import { InvitationsMultiSelectActions } from '@/invitations/InvitationsMultiSelectActions';
import { createFetcher } from '@/table/api';
import {
  selectUserInvitationsFilter,
  UserInvitationsFilter,
  UserInvitationsFilterFormId,
} from '@/table/generated/UserInvitationsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { RoleField } from '@/user/affiliations/RoleField';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';

import { ProjectPermissionsLogButton } from './ProjectPermissionsLogButton';
import { useTeamTableTabs } from './tabs';
import { TeamDropdownActions } from './TeamDropdownActions';
import { useRedirectCourseProjects } from './utils';

const InvitationsListComponent: FunctionComponent = () => {
  const project = useProject();
  const values = useFilterValues('user-invitations');
  const stateFilter = useMemo(
    () => selectUserInvitationsFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({ ...stateFilter, scope: project?.url }),
    [stateFilter, project],
  );

  const props = useTable({
    table: 'user-invitations',
    syncFiltersToURL: true,
    fetchData: createFetcher(userInvitationsList),
    filter,
    queryField: 'email',
  });

  const tabs = useTeamTableTabs(project);

  return (
    <Table<Invitation>
      {...props}
      formId={UserInvitationsFilterFormId}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              <Avatar name={row?.email} size={32} circle />
              {row.email}
              <CopyToClipboardButton value={row.email} />
            </div>
          ),

          orderField: 'email',
        },
        {
          title: translate('Role'),
          render: RoleField,
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => formatInvitationState(row.state),
          filter: 'state',
          inlineFilter: (row) => choices.filter((s) => s.value === row.state),
        },
        {
          title: translate('Created at'),
          orderField: 'created',
          render: ({ row }) => formatDate(row.created),
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
        },
      ]}
      tabs={tabs}
      rowActions={({ row }) => (
        <InvitationActions invitation={row} refetch={props.fetch} />
      )}
      title={translate('Team')}
      verboseName={translate('Team invitations')}
      tableActions={
        <>
          <ProjectPermissionsLogButton />
          <TeamDropdownActions project={project} refetch={props.fetch} />
        </>
      }
      hasQuery={true}
      expandableRow={InvitationExpandableRow}
      filters={<UserInvitationsFilter />}
      enableMultiSelect
      multiSelectActions={InvitationsMultiSelectActions}
    />
  );
};

export const InvitationsList: FunctionComponent = () => {
  const user = useUser();
  const project = useProject();
  const customer = useCustomer();
  const router = useRouter();
  useEffect(() => {
    if (
      !InvitationPolicyService.canAccessInvitations({ user, customer, project })
    ) {
      router.stateService.target('errorPage.noPermission');
    }
  }, [user, project, customer, router]);

  useRedirectCourseProjects(project);

  return <InvitationsListComponent />;
};
