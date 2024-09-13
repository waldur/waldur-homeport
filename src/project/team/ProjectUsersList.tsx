import { useSelector } from 'react-redux';

import Avatar from '@waldur/core/Avatar';
import { renderRoleExpirationDate } from '@waldur/customer/team/CustomerUsersList';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { getProject } from '@waldur/workspace/selectors';

import { AddUserButton } from './AddUserButton';
import { ProjectPermisionActions } from './ProjectPermisionActions';

const mandatoryFields = [
  // Required for actions
  'user_uuid',
  'user_email',
  'expiration_time',
  'user_full_name',
  'role_name',
  'user_username',
];

export const ProjectUsersList = () => {
  const project = useSelector(getProject);
  const tableProps = useTable({
    table: 'project-users',
    fetchData: createFetcher(`projects/${project.uuid}/list_users`),
    queryField: 'search_string',
    mandatoryFields,
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              {row.user_image ? (
                <img
                  src={row.user_image}
                  alt={row.user_username}
                  width={25}
                  height={25}
                />
              ) : (
                <Avatar
                  className="symbol symbol-25px"
                  name={row.user_full_name}
                  size={25}
                />
              )}
              {row.user_full_name || DASH_ESCAPE_CODE}
            </div>
          ),
          id: 'member',
          keys: ['user_full_name', 'user_username', 'user_image'],
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.user_email || DASH_ESCAPE_CODE,
          id: 'user_email',
          keys: ['user_email'],
        },
        {
          title: translate('Username'),
          render: ({ row }) => row.user_username,
          id: 'user_username',
          keys: ['user_username'],
          optional: true,
        },
        {
          title: translate('Role in project'),
          render: RoleField,
          id: 'role_name',
          keys: ['role_name'],
        },
        {
          title: translate('Role expiration'),
          render: ({ row }) => renderRoleExpirationDate(row),
          id: 'expiration_time',
          keys: ['expiration_time'],
        },
      ]}
      hasQuery={true}
      tableActions={<AddUserButton refetch={tableProps.fetch} />}
      title={translate('Team members')}
      verboseName={translate('Team members')}
      rowActions={ProjectPermisionActions}
      hasOptionalColumns
    />
  );
};
