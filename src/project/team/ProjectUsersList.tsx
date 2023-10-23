import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import Avatar from '@waldur/core/Avatar';
import {
  PROJECT_ADMIN_ROLE,
  PROJECT_MEMBER_ROLE,
} from '@waldur/core/constants';
import { translate } from '@waldur/i18n';
import { RoleEnum } from '@waldur/permissions/enums';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { UserDetailsButton } from '@waldur/user/UserDetailsButton';
import {
  getProject,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isStaff as isStaffSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

import { AddMemberButton } from './AddMemberButton';
import { AddUserButton } from './AddUserButton';
import { UserRemoveButton } from './UserRemoveButton';

export const ProjectUsersList = () => {
  const user = useSelector(getUser);
  const project = useSelector(getProject);
  const isStaff = useSelector(isStaffSelector);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const customer = useSelector(getCustomer);
  const isProjectManager = user.permissions?.find(
    (permission) =>
      permission.scope_type === 'project' &&
      permission.scope_uuid === project.uuid &&
      permission.role_name === RoleEnum.PROJECT_MANAGER,
  );
  const tableProps = useTable({
    table: 'project-users',
    fetchData: createFetcher(`projects/${project.uuid}/list_users`),
    queryField: 'search_string',
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              <Avatar
                className="symbol symbol-25px"
                name={row.user_full_name || row.user_username}
                size={25}
              />
              {row.user_full_name || row.user_username}
            </div>
          ),
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.user_email || 'N/A',
        },
        {
          title: translate('Role in project'),
          render: RoleField,
        },
      ]}
      hasQuery={true}
      actions={
        <ButtonGroup>
          {isStaff && <AddUserButton refetch={tableProps.fetch} />}
          {isOwnerOrStaff ? (
            <AddMemberButton
              users={tableProps.rows}
              project={project}
              customer={customer}
              refetch={tableProps.fetch}
            />
          ) : null}
        </ButtonGroup>
      }
      verboseName={translate('Team members')}
      hoverableRow={({ row }) => (
        <>
          <UserDetailsButton userId={row.user_uuid} />
          {isOwnerOrStaff ? (
            <AddMemberButton
              user={row}
              users={tableProps.rows}
              project={project}
              customer={customer}
              refetch={tableProps.fetch}
            />
          ) : null}
          {isOwnerOrStaff || isProjectManager ? (
            <UserRemoveButton
              permission={row}
              isDisabled={
                !isOwnerOrStaff &&
                (!isProjectManager ||
                  (row.role !== PROJECT_ADMIN_ROLE &&
                    row.role !== PROJECT_MEMBER_ROLE))
              }
              refetch={tableProps.fetch}
            />
          ) : null}
        </>
      )}
    />
  );
};
