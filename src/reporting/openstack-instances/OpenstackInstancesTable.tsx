import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { OpenStackInstanceReport } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import {
  MarketplaceStatsOpenstackInstancesFilter,
  MarketplaceStatsOpenstackInstancesFilterFormId,
  selectMarketplaceStatsOpenstackInstancesFilter,
} from '@/table/generated/MarketplaceStatsOpenstackInstancesFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { openstackInstancesFetcher } from './api';

const OpenstackInstancesTableTable: FC = () => {
  const { values } = useFormState();

  const filter = useMemo(
    () => selectMarketplaceStatsOpenstackInstancesFilter(values),
    [values],
  );

  const formValues = values;

  const tableProps = useTable({
    table: 'openstackInstancesReport',
    fetchData: openstackInstancesFetcher,
    queryField: 'name',
    filter,
  });

  const columns: Array<Column<OpenStackInstanceReport>> = [
    {
      id: 'name',
      title: translate('Name'),
      render: ({ row }) => <>{renderFieldOrDash(row.name)}</>,
      orderField: 'name',
      keys: ['name'],
      export: 'name',
    },
    {
      id: 'runtime_state',
      title: translate('Runtime state'),
      render: ({ row }) => <>{renderFieldOrDash(row.runtime_state)}</>,
      orderField: 'runtime_state',
      keys: ['runtime_state'],
      filter: 'runtime_state',
      inlineFilter: (row) => ({
        value: row.runtime_state,
        label: row.runtime_state,
      }),
      export: 'runtime_state',
    },
    {
      id: 'cores',
      title: translate('Cores'),
      render: ({ row }) => <>{row.cores}</>,
      orderField: 'cores',
      keys: ['cores'],
      export: 'cores',
    },
    {
      id: 'ram',
      title: translate('RAM'),
      render: ({ row }) => <>{formatFilesize(row.ram)}</>,
      keys: ['ram'],
      export: (row) => formatFilesize(row.ram),
      exportKeys: ['ram'],
    },
    {
      id: 'disk',
      title: translate('Disk'),
      render: ({ row }) => <>{formatFilesize(row.disk)}</>,
      keys: ['disk'],
      export: (row) => formatFilesize(row.disk),
      exportKeys: ['disk'],
    },
    {
      id: 'flavor_name',
      title: translate('Flavor'),
      render: ({ row }) => <>{renderFieldOrDash(row.flavor_name)}</>,
      orderField: 'flavor_name',
      keys: ['flavor_name'],
      filter: 'flavor_name',
      inlineFilter: (row) => row.flavor_name,
      export: 'flavor_name',
    },
    {
      id: 'image_name',
      title: translate('Image'),
      render: ({ row }) => <>{renderFieldOrDash(row.image_name)}</>,
      keys: ['image_name'],
      filter: 'image_name',
      inlineFilter: (row) => row.image_name,
      export: 'image_name',
    },
    {
      id: 'customer_name',
      title: translate('Organization'),
      render: ({ row }) => <>{renderFieldOrDash(row.customer_name)}</>,
      orderField: 'customer_name',
      keys: ['customer_name'],
      filter: 'organization',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      export: 'customer_name',
    },
    {
      id: 'project_name',
      title: translate('Project'),
      render: ({ row }) => <>{renderFieldOrDash(row.project_name)}</>,
      orderField: 'project_name',
      keys: ['project_name'],
      filter: 'project',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
      export: 'project_name',
    },
    // Optional columns
    {
      id: 'hypervisor_hostname',
      title: translate('Hypervisor'),
      render: ({ row }) => <>{renderFieldOrDash(row.hypervisor_hostname)}</>,
      orderField: 'hypervisor_hostname',
      optional: true,
      keys: ['hypervisor_hostname'],
      export: 'hypervisor_hostname',
    },
    {
      id: 'availability_zone_name',
      title: translate('Availability zone'),
      render: ({ row }) => <>{renderFieldOrDash(row.availability_zone_name)}</>,
      optional: true,
      keys: ['availability_zone_name'],
      export: 'availability_zone_name',
    },
    {
      id: 'tenant_name',
      title: translate('Tenant'),
      render: ({ row }) => <>{renderFieldOrDash(row.tenant_name)}</>,
      optional: true,
      keys: ['tenant_name'],
      export: 'tenant_name',
    },
    {
      id: 'service_settings_name',
      title: translate('Cluster'),
      render: ({ row }) => <>{renderFieldOrDash(row.service_settings_name)}</>,
      orderField: 'cluster_name',
      optional: true,
      keys: ['service_settings_name'],
      export: 'service_settings_name',
    },
    {
      id: 'volume_count',
      title: translate('Volume count'),
      render: ({ row }) => <>{row.volume_count}</>,
      optional: true,
      keys: ['volume_count'],
      export: 'volume_count',
    },
    {
      id: 'total_volume_size_mb',
      title: translate('Total volume size'),
      render: ({ row }) => <>{formatFilesize(row.total_volume_size_mb)}</>,
      optional: true,
      keys: ['total_volume_size_mb'],
      export: (row) => formatFilesize(row.total_volume_size_mb),
      exportKeys: ['total_volume_size_mb'],
    },
    {
      id: 'floating_ip_count',
      title: translate('Floating IPs'),
      render: ({ row }) => <>{row.floating_ip_count}</>,
      optional: true,
      keys: ['floating_ip_count'],
      export: 'floating_ip_count',
    },
    {
      id: 'port_count',
      title: translate('Port count'),
      render: ({ row }) => <>{row.port_count}</>,
      optional: true,
      keys: ['port_count'],
      export: 'port_count',
    },
    {
      id: 'internal_ips',
      title: translate('Internal IPs'),
      render: ({ row }) => (
        <>{renderFieldOrDash(row.internal_ips?.join(', '))}</>
      ),
      optional: true,
      keys: ['internal_ips'],
      export: (row) => row.internal_ips?.join(', '),
      exportKeys: ['internal_ips'],
    },
    {
      id: 'external_ips',
      title: translate('External IPs'),
      render: ({ row }) => (
        <>{renderFieldOrDash(row.external_ips?.join(', '))}</>
      ),
      optional: true,
      keys: ['external_ips'],
      export: (row) => row.external_ips?.join(', '),
      exportKeys: ['external_ips'],
    },
    {
      id: 'created',
      title: translate('Created'),
      render: ({ row }) => (
        <>{renderFieldOrDash(formatDateTime(row.created))}</>
      ),
      optional: true,
      keys: ['created'],
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
    },
    {
      id: 'start_time',
      title: translate('Start time'),
      render: ({ row }) => (
        <>{renderFieldOrDash(formatDateTime(row.start_time))}</>
      ),
      optional: true,
      keys: ['start_time'],
      orderField: 'start_time',
      export: (row) => formatDateTime(row.start_time),
      exportKeys: ['start_time'],
    },
    {
      id: 'state',
      title: translate('State'),
      render: ({ row }) => <>{renderFieldOrDash(row.state)}</>,
      optional: true,
      keys: ['state'],
      export: 'state',
    },
    {
      id: 'uuid',
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      optional: true,
      keys: ['uuid'],
      export: 'uuid',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('OpenStack instances')}
      hasOptionalColumns
      showPageSizeSelector
      enableExport
      filters={
        <MarketplaceStatsOpenstackInstancesFilter
          organizationUuid={formValues?.organization?.uuid}
        />
      }
      formId={MarketplaceStatsOpenstackInstancesFilterFormId}
    />
  );
};

export const OpenstackInstancesTable: FC<any> = (props) => (
  <Form
    id={MarketplaceStatsOpenstackInstancesFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <OpenstackInstancesTableTable {...props} />}
  </Form>
);
