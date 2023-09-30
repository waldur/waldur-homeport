import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { Table } from '@waldur/table';

import { usePermissionsTable } from './usePermissionsTable';

export const ProjectPermissions: FunctionComponent = () => {
  const tableProps = usePermissionsTable('project');

  return (
    <Table<GenericPermission>
      {...tableProps}
      title={translate('Projects')}
      columns={[
        {
          title: translate('Project'),
          render: ({ row }) => (
            <Link
              state="project.dashboard"
              params={{ uuid: row.scope_uuid }}
              label={row.scope_name}
            />
          ),
        },
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <Link
              state="organization.dashboard"
              params={{ uuid: row.customer_uuid }}
              label={row.customer_name}
            />
          ),
        },
        {
          title: translate('Role'),
          render: ({ row }) => <>{row.role_description}</>,
          className: 'text-center col-md-1',
        },
      ]}
      verboseName={translate('projects')}
    />
  );
};
