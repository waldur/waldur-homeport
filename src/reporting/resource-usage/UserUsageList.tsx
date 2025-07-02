import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComponentUserUsage } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { usageTableTabs } from '../utils';

import { ResourceUsageFilter } from './ResourceUsageFilter';
import { mapStateToFilter, UsageExpandableRow } from './ResourceUsageList';

export const UserUsageList: FC = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'UserUsageReports',
    fetchData: createFetcher('marketplace-component-user-usages'),
    filter,
  });
  const columns: Array<Column<ComponentUserUsage>> = [
    {
      title: translate('Username'),
      render: ({ row }) => <>{row.username}</>,
      export: 'username',
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
      filter: 'organization',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      export: 'customer_name',
    },
    {
      title: translate('Client project'),
      render: ({ row }) => <>{row.project_name}</>,
      filter: 'project',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
      export: 'project_name',
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
      filter: 'offering',
      inlineFilter: (row) => ({
        name: row.offering_name,
        uuid: row.offering_uuid,
      }),
      export: 'offering_name',
    },
    {
      title: translate('Resource name'),
      render: ({ row }) => (
        <ResourceLink uuid={row.resource_uuid} label={row.resource_name} />
      ),

      filter: 'resource',
      inlineFilter: (row) => ({
        name: row.resource_name,
        uuid: row.resource_uuid,
      }),
      export: 'resource_name',
    },
    {
      title: translate('Plan component name'),
      render: ({ row }) => <>{row.component_type}</>,
      export: 'component_type',
    },
    {
      title: translate('Date of reporting'),
      render: ({ row }) => <>{formatDateTime(row.date)}</>,
      export: (row) => formatDateTime(row.date),
      exportKeys: ['date'],
    },
    {
      title: translate('Value'),
      render: ({ row }) => <>{row.usage + ' ' + row.measured_unit}</>,
      export: (row) => row.usage + ' ' + row.measured_unit,
      exportKeys: ['usage', 'measured_unit'],
    },
    {
      visible: false,
      title: translate('Comment'),
      render: null,
      export: 'description',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      tabs={usageTableTabs}
      verboseName={translate('Usages')}
      showPageSizeSelector={true}
      enableExport={true}
      expandableRow={UsageExpandableRow}
      filters={<ResourceUsageFilter />}
    />
  );
};
