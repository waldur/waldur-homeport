import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { marketplaceStatsProviderCustomersRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { CustomerAcquisitionTrendChart } from './CustomerAcquisitionTrendChart';
import { ProviderFilter } from './ProviderFilter';
import { TopCustomersByResources } from './TopCustomersByResources';
import { TopCustomersByRevenue } from './TopCustomersByRevenue';
import { MonthlyData, TopCustomer } from './types';

const ProviderCustomersContent: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-customers', providerUuid],
    queryFn: async () => {
      const response = await marketplaceStatsProviderCustomersRetrieve({
        query: { provider_uuid: providerUuid },
      });
      return response.data;
    },
    enabled: !!providerUuid,
  });

  const stats = useMemo(
    () =>
      data
        ? [
            {
              label: translate('Total customers'),
              value: data.total,
            },
            {
              label: translate('New this month'),
              value: data.new_this_month,
            },
          ]
        : [],
    [data],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  const topByRevenue = (data.top_by_revenue as unknown as TopCustomer[]) || [];
  const topByResources =
    (data.top_by_resources as unknown as TopCustomer[]) || [];

  return (
    <>
      <SummaryWidget stats={stats} />

      <Row className="g-4 mb-6">
        <Col xs={12}>
          <CustomerAcquisitionTrendChart
            monthly={(data.monthly as unknown as MonthlyData[]) || []}
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <TopCustomersByRevenue customers={topByRevenue} />
        </Col>
        <Col xs={12} lg={6}>
          <TopCustomersByResources customers={topByResources} />
        </Col>
      </Row>
    </>
  );
};

export const ProviderCustomersPage: FC = () => {
  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  return (
    <>
      <ReportingTitle reportKey="provider-customers">
        <div className="d-flex align-items-center gap-4">
          <label className="text-muted fs-7 fw-semibold whitespace-nowrap">
            {translate('Provider')}:
          </label>
          <div style={{ minWidth: 200 }}>
            <ProviderFilter />
          </div>
        </div>
      </ReportingTitle>

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
    </>
  );
};
