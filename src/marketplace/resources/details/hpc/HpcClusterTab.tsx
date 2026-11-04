import { FC, useCallback } from 'react';
import {
  HpcPartition,
  hpcWorkspacesPartitionsList,
  HpcWorkspaceOverview,
  Resource,
} from 'waldur-js-client';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PropertyItem,
  PropertyList,
  Tooltip,
} from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { HpcErrorAlert } from './HpcErrorAlert';
import { HPC_QUERY_OPTIONS, useHpcOverview } from './queries';
import { HPC_CARD_CLASS, formatMinutes, getInMemoryPage } from './utils';

const HealthBadges: FC<{ overview: HpcWorkspaceOverview }> = ({ overview }) => (
  <div className="flex flex-wrap gap-2">
    {overview.services_health.map((service, index) => (
      <Tooltip
        key={`${service.service_type}-${index}`}
        label={service.message || undefined}
      >
        <span>
          <Badge
            variant={service.healthy ? 'success' : 'danger'}
            shape="pill"
            tone="outline"
          >
            {service.service_type || translate('Service')}
          </Badge>
        </span>
      </Tooltip>
    ))}
  </div>
);

const OverviewCard: FC<{ resourceUuid: string }> = ({ resourceUuid }) => {
  const { data: overview, isLoading, error } = useHpcOverview(resourceUuid);
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <HpcErrorAlert error={error} />;
  }
  if (!overview) return null;
  return (
    <>
      <HpcErrorAlert
        message={overview.error}
        signInProvider={overview.sign_in_provider}
      />
      <Card className={HPC_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            {translate('Cluster')}
          </CardTitle>
          {overview.healthy !== null && (
            <Badge
              variant={overview.healthy ? 'success' : 'danger'}
              shape="pill"
            >
              {overview.healthy ? translate('Healthy') : translate('Degraded')}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <PropertyList variant="summary" termWidth="sm">
            <PropertyItem
              label={translate('System')}
              value={overview.system_name}
            />
            <PropertyItem
              label={translate('Account')}
              value={overview.account}
            />
            <PropertyItem
              label={translate('User name on cluster')}
              value={overview.username}
            />
            <PropertyItem
              label={translate('Home directory')}
              value={overview.home_directory}
            />
            <PropertyItem
              label={translate('Services')}
              value={
                overview.services_health?.length ? (
                  <HealthBadges overview={overview} />
                ) : null
              }
            />
          </PropertyList>
        </CardContent>
      </Card>
    </>
  );
};

const renderNumber = (value?: number | null) =>
  value === null || value === undefined ? renderFieldOrDash(null) : value;

const getPartitionColumns = (): Column<HpcPartition>[] => [
  {
    title: translate('Partition'),
    render: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{row.name}</span>
        {!row.published && (
          <Tooltip
            label={translate(
              'The cluster reports this partition but the provider does not publish it in Waldur.',
            )}
          >
            <span>
              <Badge variant="neutral" shape="pill" tone="outline">
                {translate('Unpublished')}
              </Badge>
            </span>
          </Tooltip>
        )}
        {!row.live && (
          <Tooltip
            label={translate('The cluster does not report this partition.')}
          >
            <span>
              <Badge variant="warning" shape="pill" tone="outline">
                {translate('Not live')}
              </Badge>
            </span>
          </Tooltip>
        )}
      </div>
    ),
  },
  {
    title: translate('Idle / total nodes'),
    render: ({ row }) =>
      row.total_nodes === null
        ? renderFieldOrDash(null)
        : `${row.idle_nodes ?? '?'} / ${row.total_nodes}`,
  },
  {
    title: translate('CPUs'),
    render: ({ row }) => renderNumber(row.cpus),
  },
  {
    title: translate('Max time'),
    render: ({ row }) => renderFieldOrDash(formatMinutes(row.max_time)),
  },
  {
    title: translate('Default time'),
    render: ({ row }) => renderFieldOrDash(formatMinutes(row.default_time)),
  },
  {
    title: translate('Max nodes'),
    render: ({ row }) => renderNumber(row.max_nodes),
  },
  {
    title: translate('Max CPUs per node'),
    render: ({ row }) => renderNumber(row.max_cpus_per_node),
  },
  {
    title: translate('Max memory per node'),
    render: ({ row }) =>
      row.max_mem_per_node
        ? formatFilesize(row.max_mem_per_node)
        : renderFieldOrDash(null),
  },
  {
    title: translate('Architecture'),
    render: ({ row }) =>
      renderFieldOrDash(
        [row.cpu_arch, row.gpu_arch].filter(Boolean).join(' / '),
      ),
  },
  {
    title: translate('QoS'),
    render: ({ row }) =>
      row.qos?.length ? (
        <div className="flex flex-wrap gap-2 py-2">
          {row.qos.map((qos) => (
            <Badge
              key={qos}
              variant={qos === row.default_qos ? 'primary' : 'neutral'}
              shape="pill"
              tone="outline"
            >
              {qos === row.default_qos
                ? translate('{qos} (default)', { qos })
                : qos}
            </Badge>
          ))}
        </div>
      ) : (
        renderFieldOrDash(row.default_qos)
      ),
  },
];

const PartitionsTable: FC<{ resourceUuid: string }> = ({ resourceUuid }) => {
  const fetchData = useCallback(
    (request) =>
      hpcWorkspacesPartitionsList({
        path: { uuid: resourceUuid },
        signal: request.options?.signal,
      }).then((response) => getInMemoryPage(response.data, request)),
    [resourceUuid],
  );
  const tableProps = useTable<HpcPartition>({
    table: `hpc-partitions-${resourceUuid}`,
    fetchData,
    meta: HPC_QUERY_OPTIONS.meta,
    retry: HPC_QUERY_OPTIONS.retry,
  });
  return (
    <>
      <HpcErrorAlert error={tableProps.error} />
      <Table<HpcPartition>
        {...tableProps}
        title={translate('Partitions')}
        verboseName={translate('partitions')}
        rowKey="name"
        cardBordered
        className="mb-6"
        columns={getPartitionColumns()}
      />
    </>
  );
};

export const HpcClusterTab: FC<{ resource: Resource }> = ({ resource }) => (
  <>
    <OverviewCard resourceUuid={resource.uuid} />
    <PartitionsTable resourceUuid={resource.uuid} />
  </>
);
