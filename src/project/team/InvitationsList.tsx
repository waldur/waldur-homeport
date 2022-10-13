import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import Gravatar from 'react-gravatar';
import { connect, useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { InvitationCancelButton } from '@waldur/invitations/actions/InvitationCancelButton';
import { InvitationCreateButton } from '@waldur/invitations/actions/InvitationCreateButton';
import { InvitationPolicyService } from '@waldur/invitations/actions/InvitationPolicyService';
import { InvitationSendButton } from '@waldur/invitations/actions/InvitationSendButton';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { InvitationsFilter } from '@waldur/invitations/InvitationsFilter';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import {
  getCustomer,
  getProject,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { fetchProjectManagers } from './api';
import { RoleField } from './RoleField';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <>
              <Gravatar email={row.email} size={25} /> {row.email}
            </>
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
        {
          title: translate('Actions'),
          visible: props.canManage,
          render: ({ row }) => (
            <>
              <InvitationSendButton invitation={row} />
              <InvitationCancelButton
                invitation={row}
                refreshList={props.fetch}
              />
            </>
          ),
        },
      ]}
      verboseName={translate('Team invitations')}
      actions={
        <InvitationCreateButton
          project={props.project}
          refreshList={props.fetch}
        />
      }
      hasQuery={true}
      expandableRow={InvitationExpandableRow}
    />
  );
};

const mapPropsToFilter = (props) => ({
  ...props.stateFilter,
  project: props.project.uuid,
});

const TableOptions: TableOptionsType = {
  table: 'user-invitations',
  fetchData: createFetcher('user-invitations'),
  mapPropsToFilter,
  queryField: 'email',
};

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
  stateFilter: getFormValues('InvitationsFilter')(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

const InvitationsListComponent = enhance(
  TableComponent,
) as React.ComponentType<any>;

export const InvitationsList: FunctionComponent = () => {
  const user = useSelector(getUser);
  const project = useSelector(getProject);
  const { loading, error, value } = useAsync(
    async () => await fetchProjectManagers(user, project),
    [user, project],
  );
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isProjectManager = value && value.length > 0;

  const customer = useSelector(getCustomer);
  const router = useRouter();
  const canAccessInvitations = InvitationPolicyService.canAccessInvitations({
    user,
    customer,
    project,
  });
  if (!canAccessInvitations) {
    router.stateService.go('profile.details');
  }

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load data')}</>;
  }
  return (
    <InvitationsListComponent
      filters={<InvitationsFilter />}
      canManage={isProjectManager || isOwnerOrStaff}
      project={project}
    />
  );
};
