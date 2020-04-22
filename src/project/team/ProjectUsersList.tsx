import * as React from 'react';
import * as Gravatar from 'react-gravatar';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Table, connectTable } from '@waldur/table-react';
import { TableOptionsType } from '@waldur/table-react/types';
import {
  getProject,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

import { AddMemberButton } from './AddMemberButton';
import { fetchProjectUsers, fetchProjectManagers } from './api';
import { UserDetailsButton } from './UserDetailsButton';
import { UserRemoveButton } from './UserRemoveButton';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <>
              <Gravatar email={row.email} size={25} />{' '}
              {row.full_name || row.username}
            </>
          ),
        },
        {
          title: translate('E-mail'),
          render: ({ row }) => row.email || 'N/A',
        },
        {
          title: translate('Role in project'),
          render: ({ row }) => ENV.roles[row.role],
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <>
              <UserDetailsButton user={row} />
              {props.isOwnerOrStaff ? (
                <AddMemberButton
                  user={row}
                  users={props.rows}
                  project={props.project}
                  customer={props.customer}
                  isProjectManager={props.isProjectManager}
                />
              ) : null}
              {props.isOwnerOrStaff || props.isProjectManager ? (
                <UserRemoveButton
                  user={row}
                  isProjectManager={props.isProjectManager}
                />
              ) : null}
            </>
          ),
        },
      ]}
      actions={
        props.isOwnerOrStaff || props.isProjectManager ? (
          <AddMemberButton
            users={props.rows}
            project={props.project}
            customer={props.customer}
            isProjectManager={props.isProjectManager}
          />
        ) : null
      }
      verboseName={translate('team members')}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'project-users',
  fetchData: fetchProjectUsers,
  queryField: 'full_name',
  mapPropsToFilter: props => ({
    project_uuid: props.project.uuid,
    o: 'concatenated_name',
  }),
};

const ProjectUsersListComponent = connectTable(TableOptions)(TableComponent);

export const ProjectUsersList = () => {
  const user = useSelector(getUser);
  const project = useSelector(getProject);
  const { loading, error, value } = useAsync(
    async () => await fetchProjectManagers(user, project),
    [user, project],
  );
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const customer = useSelector(getCustomer);
  const isProjectManager = value && value.length > 0 && isOwnerOrStaff;
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load data')}</>;
  }
  return (
    <ProjectUsersListComponent
      project={project}
      customer={customer}
      user={user}
      isProjectManager={isProjectManager}
      isOwnerOrStaff={isOwnerOrStaff}
    />
  );
};
