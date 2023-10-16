import { useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import Avatar from '@waldur/core/Avatar';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';
import { InvitationCancelButton } from '@waldur/invitations/actions/InvitationCancelButton';
import { InvitationPolicyService } from '@waldur/invitations/actions/InvitationPolicyService';
import { InvitationSendButton } from '@waldur/invitations/actions/InvitationSendButton';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { InvitationsFilter } from '@waldur/invitations/InvitationsFilter';
import { RoleEnum } from '@waldur/permissions/enums';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import {
  getCustomer,
  getProject,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { RoleField } from './RoleField';

const TableComponent: FunctionComponent<any> = (props) => {
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
      hoverableRow={
        props.canManage ?? true
          ? ({ row }) => (
              <>
                <InvitationSendButton invitation={row} />
                <InvitationCancelButton
                  invitation={row}
                  refetch={props.fetch}
                />
              </>
            )
          : undefined
      }
      verboseName={translate('Team invitations')}
      actions={
        <InvitationCreateButton project={props.project} refetch={props.fetch} />
      }
      hasQuery={true}
      expandableRow={InvitationExpandableRow}
    />
  );
};

const mapPropsToFilter = (props) => ({
  ...props.stateFilter,
  project: props.project.uuid,
  state: props.stateFilter?.state?.map((option) => option.value),
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
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isProjectManager = user.permissions?.find(
    (permission) =>
      permission.scope_type === 'project' &&
      permission.scope_uuid === project.uuid &&
      permission.role_name === RoleEnum.PROJECT_MANAGER,
  );

  return (
    <InvitationsListComponent
      filters={<InvitationsFilter />}
      canManage={isProjectManager || isOwnerOrStaff}
      project={project}
    />
  );
};
