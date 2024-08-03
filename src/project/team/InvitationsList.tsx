import { useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import Avatar from '@waldur/core/Avatar';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';
import { InvitationCancelButton } from '@waldur/invitations/actions/InvitationCancelButton';
import { InvitationPolicyService } from '@waldur/invitations/actions/InvitationPolicyService';
import { InvitationSendButton } from '@waldur/invitations/actions/InvitationSendButton';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { InvitationsFilter } from '@waldur/invitations/InvitationsFilter';
import { RoleField } from '@waldur/invitations/RoleField';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

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
    <Table
      {...props}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              <Avatar
                className="symbol symbol-25px"
                name={row?.email}
                size={25}
              />
              {row.email}
            </div>
          ),
          orderField: 'email',
        },
        {
          title: translate('Role'),
          render: ({ row }) => <RoleField invitation={row} />,
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => row.state,
          filter: 'state',
        },
        {
          title: translate('Created at'),
          orderField: 'created',
          render: ({ row }) => formatDate(row.created),
        },
        {
          title: translate('Expires at'),
          orderField: 'expires',
          render: ({ row }) => formatDate(row.expires),
        },
      ]}
      hoverableRow={({ row }) => (
        <>
          <InvitationSendButton row={row} />
          <InvitationCancelButton row={row} refetch={props.fetch} />
        </>
      )}
      verboseName={translate('Team invitations')}
      actions={
        <InvitationCreateButton
          project={project}
          roleTypes={['project']}
          refetch={props.fetch}
          enableBulkUpload={true}
        />
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
  const user = useSelector(getUser);
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
