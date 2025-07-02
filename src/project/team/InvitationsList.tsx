import { useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { Invitation } from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationPolicyService } from '@waldur/invitations/actions/InvitationPolicyService';
import { InvitationActions } from '@waldur/invitations/InvitationActions';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { InvitationsFilter } from '@waldur/invitations/InvitationsFilter';
import { formatInvitationState } from '@waldur/invitations/InvitationStateFilter';
import { choices } from '@waldur/invitations/InvitationStateFilter';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { PROJECT_TEAM_TABLE_TABS } from '../utils';

import { ProjectPermissionsLogButton } from './ProjectPermissionsLogButton';
import { TeamDropdownActions } from './TeamDropdownActions';

const InvitationsListComponent: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'user-invitations',
    fetchData: createFetcher('user-invitations'),
    filter,
    queryField: 'email',
  });
  const project = useSelector(getProject);
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
      tabs={PROJECT_TEAM_TABLE_TABS}
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
      filters={<InvitationsFilter />}
    />
  );
};

const mapStateToFilter = createSelector(
  getProject,
  getFormValues('InvitationsFilter'),
  (project, stateFilter: any) => ({
    ...stateFilter,
    scope: project.url,
    state: stateFilter?.state?.map((option) => option.value),
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
      router.stateService.target('errorPage.notFound');
    }
  }, [user, project, customer, router]);

  return <InvitationsListComponent />;
};
