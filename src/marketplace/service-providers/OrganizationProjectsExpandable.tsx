import { useMemo } from 'react';
import { marketplaceServiceProvidersCustomerProjectsList } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ProjectCostField } from '@/project/ProjectCostField';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ResourcesColumn } from './ResourcesColumn';

export const OrganizationProjectsExpandable = ({
  row,
  provider_uuid,
  provider_customer_uuid,
}) => {
  const tableOptions = useMemo(
    () => ({
      table: `OrganizationProjects-${row.uuid}`,
      fetchData: createFetcher(
        marketplaceServiceProvidersCustomerProjectsList,
        { path: { service_provider_uuid: provider_uuid } },
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
          copyField: (row) => row.name,
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          title: translate('End date'),
          render: ({ row }) =>
            row.end_date ? formatDate(row.end_date) : translate('No end date'),
        },
        {
          title: translate('Resources'),
          render: ({ row }) => (
            <ResourcesColumn
              row={row}
              provider_customer_uuid={provider_customer_uuid}
            />
          ),
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
