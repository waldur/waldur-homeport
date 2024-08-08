import { useSelector } from 'react-redux';

import Avatar from '@waldur/core/Avatar';
import { renderRoleExpirationDate } from '@waldur/customer/team/CustomerUsersList';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { RoleField } from '@waldur/user/affiliations/RoleField';
import { getProject } from '@waldur/workspace/selectors';

import { AddUserButton } from './AddUserButton';
import { ProjectPermisionActions } from './ProjectPermisionActions';

export const ProjectUsersList = () => {
  const project = useSelector(getProject);
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
        {
          title: translate('Role expiration'),
          render: ({ row }) => renderRoleExpirationDate(row),
        },
      ]}
      hasQuery={true}
      tableActions={<AddUserButton refetch={tableProps.fetch} />}
      title={translate('Team members')}
      verboseName={translate('Team members')}
      rowActions={ProjectPermisionActions}
    />
  );
};
