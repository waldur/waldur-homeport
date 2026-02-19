import { useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Invitation, userInvitationsList } from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationPolicyService } from '@waldur/invitations/actions/InvitationPolicyService';
import { formatInvitationState } from '@waldur/invitations/choices';
import { choices } from '@waldur/invitations/choices';
import { InvitationActions } from '@waldur/invitations/InvitationActions';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { InvitationsMultiSelectActions } from '@waldur/invitations/InvitationsMultiSelectActions';
import { createFetcher } from '@waldur/table/api';
import {
  selectUserInvitationsFilter,
  UserInvitationsFilter,
} from '@waldur/table/generated/UserInvitationsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { ProjectPermissionsLogButton } from './ProjectPermissionsLogButton';
import { useTeamTableTabs } from './tabs';
import { TeamDropdownActions } from './TeamDropdownActions';
import { useRedirectCourseProjects } from './utils';

const InvitationsListComponent: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'user-invitations',
    fetchData: createFetcher(userInvitationsList),
    filter,
    queryField: 'email',
  });
  const project = useSelector(getProject);

  const tabs = useTeamTableTabs(project);

  return (
    <Table<Invitation>
      {...props}
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

const mapStateToFilter = createSelector(
  getProject,
  selectUserInvitationsFilter,
  (project, stateFilter: any) => ({
    ...stateFilter,
    scope: project.url,
  }),
);

export const InvitationsList: FunctionComponent = () => {
  const user = useUser();
  const project = useSelector(getProject);
  const customer = useSelector(getCustomer);
  const router = useRouter();
  useEffect(() => {
    if (
      !InvitationPolicyService.canAccessInvitations({
        user,
        customer,
        project,
      })
    ) {
      router.stateService.target('errorPage.noPermission');
    }
  }, [user, project, customer, router]);

  useRedirectCourseProjects(project);

  return <InvitationsListComponent />;
};
