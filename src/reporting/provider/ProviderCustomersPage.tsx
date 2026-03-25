import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceStatsProviderCustomersRetrieve,
  ProviderCustomerStats,
} from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';
import { ExportData } from '@waldur/table/exporters/types';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';
import { ChartCard } from '../users/charts/ChartCard';

import { CustomerAcquisitionTrendChart } from './CustomerAcquisitionTrendChart';
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

  const getTopRevenueExportData = useMemo(
    () => (): ExportData => ({
      fields: [translate('Customer'), translate('Revenue')],
      data: ((data?.top_by_revenue as unknown as TopCustomer[]) || []).map(
        (c) => [c.customer_name, c.revenue || 0],
      ),
    }),
    [data?.top_by_revenue],
  );

  const getTopResourcesExportData = useMemo(
    () => (): ExportData => ({
      fields: [translate('Customer'), translate('Resources')],
      data: ((data?.top_by_resources as unknown as TopCustomer[]) || []).map(
        (c) => [c.customer_name, c.resource_count || 0],
      ),
    }),
    [data?.top_by_resources],
  );

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
          <CustomerAcquisitionTrendChart
            monthly={(data.monthly as unknown as MonthlyData[]) || []}
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <ChartCard
            title={translate('Top customers by revenue')}
            getExportData={getTopRevenueExportData}
            isEmpty={topByRevenue.length === 0}
          >
            {() => (
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
            )}
          </ChartCard>
        </Col>
        <Col xs={12} lg={6}>
          <ChartCard
            title={translate('Top customers by resources')}
            getExportData={getTopResourcesExportData}
            isEmpty={topByResources.length === 0}
          >
            {() => (
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
            )}
          </ChartCard>
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
    <div className="container-fluid py-6">
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Provider')}
          className="flex-grow-1 mw-300px"
        >
          <ProviderFilter />
        </FormGroup>
      </div>

      {providerUuid ? (
        <ProviderCustomersContent providerUuid={providerUuid} />
      ) : (
        <NoResult
          title={translate('Select a provider')}
          message={translate(
            'Choose a provider from the dropdown above to view customer statistics.',
          )}
          noAction
        />
      )}
    </div>
  );
};
