import { useMemo } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ProjectCostField } from '@waldur/project/ProjectCostField';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ResourcesColumn } from './ResourcesColumn';

export const OrganizationProjectsExpandable = ({ row, provider_uuid }) => {
  const tableOptions = useMemo(
    () => ({
      table: `OrganizationProjects-${row.uuid}`,
      fetchData: createFetcher(
        `marketplace-service-providers/${provider_uuid}/customer_projects`,
      ),
      filter: {
        project_customer_uuid: row.uuid,
      },
    }),
    [row, provider_uuid],
  );
  const tableProps = useTable(tableOptions);
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description || 'N/A',
        },
        {
          title: translate('End date'),
          render: ({ row }) =>
            row.project_end_date
              ? formatDate(row.end_date)
              : translate('No end date'),
        },
        {
          title: translate('Resources'),
          render: ResourcesColumn,
        },
        {
          title: translate('Estimated cost'),
          render: ProjectCostField,
        },
        {
          title: translate('Members'),
          render: ({ row }) =>
            translate('{count} members', { count: row.users_count || 0 }),
        },
      ]}
      verboseName={translate('projects')}
      hasActionBar={false}
    />
  );
};
