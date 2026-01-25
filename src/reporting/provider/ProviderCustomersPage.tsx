import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceStatsProviderCustomersRetrieve,
  ProviderCustomerStats,
} from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';

interface TopCustomer {
  customer_uuid: string;
  customer_name: string;
  resource_count?: number;
  revenue?: number;
}

interface MonthlyData {
  month: string;
  customer_count: number;
}

const ProviderCustomersContent: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-customers', providerUuid],
    queryFn: async () => {
      const response = await marketplaceStatsProviderCustomersRetrieve({
        query: { provider_uuid: providerUuid },
      });
      return response.data as ProviderCustomerStats;
    },
    enabled: !!providerUuid,
  });

  const monthlyChartOptions = useMemo(() => {
    if (!data?.monthly || (data.monthly as unknown[]).length === 0) return null;

    const monthly = data.monthly as unknown as MonthlyData[];
    const months = monthly.map((m) =>
      DateTime.fromFormat(m.month, 'yyyy-MM').toFormat('MMM yyyy'),
    );
    const counts = monthly.map((m) => m.customer_count);

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
        name: translate('New customers'),
        minInterval: 1,
      },
      series: [
        {
          name: translate('New customers'),
          type: 'line',
          data: counts,
          smooth: true,
          itemStyle: { color: '#50cd89' },
          areaStyle: { color: 'rgba(80, 205, 137, 0.1)' },
        },
      ],
    };
  }, [data]);

  const revenueColumns: Column<TopCustomer>[] = useMemo(
    () => [
      {
        title: translate('Customer'),
        render: ({ row }) => <span>{row.customer_name}</span>,
      },
      {
        title: translate('Revenue'),
        render: ({ row }) => (
          <span className="fw-bold text-success">
            {defaultCurrency(row.revenue || 0)}
          </span>
        ),
      },
    ],
    [],
  );

  const resourceColumns: Column<TopCustomer>[] = useMemo(
    () => [
      {
        title: translate('Customer'),
        render: ({ row }) => <span>{row.customer_name}</span>,
      },
      {
        title: translate('Resources'),
        render: ({ row }) => (
          <span className="fw-bold text-primary">{row.resource_count}</span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  const topByRevenue = (data.top_by_revenue as unknown as TopCustomer[]) || [];
  const topByResources =
    (data.top_by_resources as unknown as TopCustomer[]) || [];

  return (
    <>
      <Row className="g-4 mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-primary">{data.total}</div>
              <div className="text-muted fs-7">
                {translate('Total customers')}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-success">
                {data.new_this_month}
              </div>
              <div className="text-muted fs-7">
                {translate('New this month')}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-6">
        <Col xs={12}>
          <Card>
            <Card.Header>
              <Card.Title>
                {translate('Customer acquisition trend (12 months)')}
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

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header>
              <Card.Title>{translate('Top customers by revenue')}</Card.Title>
            </Card.Header>
            <Card.Body className="p-0">
              <Table
                columns={revenueColumns}
                rows={topByRevenue}
                fetch={() => {}}
                loading={false}
                error={null}
                activeColumns={{}}
                columnPositions={[]}
                resetSelection={() => {}}
                setFilterPosition={() => {}}
                initColumnPositions={() => {}}
                resetPagination={() => {}}
                hasPagination={false}
                hideRefresh
              />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header>
              <Card.Title>{translate('Top customers by resources')}</Card.Title>
            </Card.Header>
            <Card.Body className="p-0">
              <Table
                columns={resourceColumns}
                rows={topByResources}
                fetch={() => {}}
                loading={false}
                error={null}
                activeColumns={{}}
                columnPositions={[]}
                resetSelection={() => {}}
                setFilterPosition={() => {}}
                initColumnPositions={() => {}}
                resetPagination={() => {}}
                hasPagination={false}
                hideRefresh
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export const ProviderCustomersPage: FC = () => {
  useTitle(translate('Provider customers'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'customers' });

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
        <ProviderCustomersContent providerUuid={providerUuid} />
      ) : (
        <Card>
          <Card.Body className="text-center text-muted py-10">
            {translate('Please select a provider to view customer statistics')}
          </Card.Body>
        </Card>
      )}
    </>
  );
};
