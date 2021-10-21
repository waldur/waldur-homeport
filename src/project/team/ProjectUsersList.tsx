import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import Gravatar from 'react-gravatar';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Table, connectTable } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import {
  getProject,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isStaff as isStaffSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

import { AddMemberButton } from './AddMemberButton';
import { AddUserButton } from './AddUserButton';
import { fetchProjectUsers, fetchProjectManagers } from './api';
import { UserDetailsButton } from './UserDetailsButton';
import { UserRemoveButton } from './UserRemoveButton';

const TableComponent: FunctionComponent<any> = (props) => {
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
          title: translate('Email'),
          render: ({ row }) => row.email || 'N/A',
        },
        {
          title: translate('Role in project'),
          render: ({ row }) => translate(ENV.roles[row.role]) || 'N/A',
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
                  refreshList={props.fetch}
                />
              ) : null}
              {props.isOwnerOrStaff || props.isProjectManager ? (
                <UserRemoveButton
                  user={row}
                  isProjectManager={props.isProjectManager}
                  refreshList={props.fetch}
                />
              ) : null}
            </>
          ),
        },
      ]}
      actions={
        <ButtonGroup>
          {props.isStaff && <AddUserButton refreshList={props.fetch} />}
          {props.isOwnerOrStaff || props.isProjectManager ? (
            <AddMemberButton
              users={props.rows}
              project={props.project}
              customer={props.customer}
              isProjectManager={props.isProjectManager}
              refreshList={props.fetch}
            />
          ) : null}
        </ButtonGroup>
      }
      verboseName={translate('team members')}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'project-users',
  fetchData: fetchProjectUsers,
  queryField: 'full_name',
  mapPropsToFilter: (props) =>
    props.project
      ? {
          project_uuid: props.project.uuid,
          o: 'concatenated_name',
        }
      : {},
};

const ProjectUsersListComponent = connectTable(TableOptions)(TableComponent);

export const ProjectUsersList: FunctionComponent = () => {
  const user = useSelector(getUser);
  const project = useSelector(getProject);
  const { loading, error, value } = useAsync(
    async () => await fetchProjectManagers(user, project),
    [user, project],
  );
  const isStaff = useSelector(isStaffSelector);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const customer = useSelector(getCustomer);
  const isProjectManager = value && value.length > 0;
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
      isStaff={isStaff}
    />
  );
};
