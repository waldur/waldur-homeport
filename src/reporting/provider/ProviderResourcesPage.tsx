import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceResourcesList,
  marketplaceStatsProviderResourcesRetrieve,
  ProviderResourceStats,
  Resource,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { EChart } from '@waldur/core/EChart';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';

const RESOURCE_STATE_COLORS: Record<string, string> = {
  OK: '#50cd89',
  Updating: '#ffc700',
  Erred: '#f1416c',
  Creating: '#009ef7',
  Terminated: '#7e8299',
};

const RESOURCE_STATE_LABELS: Record<string, string> = {
  OK: translate('OK'),
  Updating: translate('Updating'),
  Erred: translate('Erred'),
  Creating: translate('Creating'),
  Terminated: translate('Terminated'),
};

interface MonthlyData {
  month: string;
  count: number;
}

// Resource name column with link
const ResourceNameColumn = ({ row }: { row: Resource }) => (
  <Link
    state="marketplace-public-resource-details"
    params={{ resource_uuid: row.uuid }}
    className="text-dark text-hover-primary fw-semibold"
  >
    {row.name || row.offering_name}
  </Link>
);

// Table columns for provider resources
const resourceColumns: Column<Resource>[] = [
  {
    title: translate('Name'),
    render: ResourceNameColumn,
    orderField: 'name',
  },
  {
    title: translate('Offering'),
    render: ({ row }) => <span>{row.offering_name}</span>,
  },
  {
    title: translate('Customer'),
    render: ({ row }) => <span>{row.customer_name}</span>,
  },
  {
    title: translate('Project'),
    render: ({ row }) => <span>{row.project_name}</span>,
  },
  {
    title: translate('State'),
    render: ({ row }) => <ResourceStateField resource={row} pill outline />,
    orderField: 'state',
  },
  {
    title: translate('Created'),
    render: ({ row }) => <span>{formatDateTime(row.created)}</span>,
    orderField: 'created',
  },
];

// Resources table component using useTable
const ProviderResourcesTable: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const filter = useMemo(
    () => ({
      provider_uuid: providerUuid,
      field: [
        'uuid',
        'name',
        'offering_name',
        'customer_name',
        'project_name',
        'state',
        'created',
        'backend_metadata',
      ],
    }),
    [providerUuid],
  );

  const tableProps = useTable({
    table: 'ProviderResourcesTable',
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
  });

  return (
    <Table<Resource>
      {...tableProps}
      columns={resourceColumns}
      verboseName={translate('resources')}
      title={translate('All resources')}
      showPageSizeSelector
      initialSorting={{ field: 'created', mode: 'desc' }}
    />
  );
};

const ProviderResourcesContent: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-resources', providerUuid],
    queryFn: async () => {
      const response = await marketplaceStatsProviderResourcesRetrieve({
        query: { provider_uuid: providerUuid },
      });
      return response.data as ProviderResourceStats;
    },
    enabled: !!providerUuid,
  });

  const stateChartOptions = useMemo(() => {
    if (!data?.by_state) return null;

    const chartData = Object.entries(data.by_state)
      .filter(([, value]) => (value as number) > 0)
      .map(([state, value]) => ({
        name: RESOURCE_STATE_LABELS[state] || state,
        value,
        itemStyle: { color: RESOURCE_STATE_COLORS[state] || '#7e8299' },
      }));

    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', right: '5%', top: 'center' },
      series: [
        {
          name: translate('Resources by State'),
          type: 'pie',
          radius: ['40%', '70%'],
          data: chartData,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        },
      ],
    };
  }, [data]);

  const monthlyChartOptions = useMemo(() => {
    if (!data?.monthly || (data.monthly as unknown[]).length === 0) return null;

    const monthly = data.monthly as unknown as MonthlyData[];
    const months = monthly.map((m) =>
      DateTime.fromFormat(m.month, 'yyyy-MM').toFormat('MMM yyyy'),
    );
    const counts = monthly.map((m) => m.count);

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: 'value',
        name: translate('New resources'),
        minInterval: 1,
      },
      series: [
        {
          name: translate('New resources'),
          type: 'line',
          data: counts,
          smooth: true,
          itemStyle: { color: '#009ef7' },
          areaStyle: { color: 'rgba(0, 158, 247, 0.1)' },
        },
      ],
    };
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  const byState = data.by_state as Record<string, number> | undefined;
  const okCount = byState?.OK || 0;
  const erredCount = byState?.Erred || 0;

  return (
    <>
      <Row className="g-4 mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-primary">{data.total}</div>
              <div className="text-muted fs-7">
                {translate('Total active resources')}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-success">{okCount}</div>
              <div className="text-muted fs-7">{translate('Healthy (OK)')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-danger">{erredCount}</div>
              <div className="text-muted fs-7">{translate('Erred')}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-6">
        <Col xs={12} lg={6}>
          <Card className="h-100">
            <Card.Header>
              <Card.Title>{translate('Resources by state')}</Card.Title>
            </Card.Header>
            <Card.Body>
              {stateChartOptions ? (
                <EChart options={stateChartOptions} height="300px" />
              ) : (
                <div className="text-center text-muted py-10">
                  {translate('No data available')}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="h-100">
            <Card.Header>
              <Card.Title>
                {translate('Resource creation trend (12 months)')}
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {monthlyChartOptions ? (
                <EChart options={monthlyChartOptions} height="300px" />
              ) : (
                <div className="text-center text-muted py-10">
                  {translate('No data available')}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export const ProviderResourcesPage: FC = () => {
  useTitle(translate('Provider resources'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'resources' });

  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  return (
    <>
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>{translate('Select provider')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <ProviderFilter />
        </Card.Body>
      </Card>

      {providerUuid ? (
        <>
          <ProviderResourcesContent providerUuid={providerUuid} />
          <ProviderResourcesTable providerUuid={providerUuid} />
        </>
      ) : (
        <Card>
          <Card.Body className="text-center text-muted py-10">
            {translate('Please select a provider to view resource statistics')}
          </Card.Body>
        </Card>
      )}
    </>
  );
};
