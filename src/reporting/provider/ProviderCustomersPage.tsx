import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplaceStatsProviderCustomersRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { CustomerAcquisitionTrendChart } from './CustomerAcquisitionTrendChart';
import { ProviderSelector } from './ProviderSelector';
import { TopCustomersByResources } from './TopCustomersByResources';
import { TopCustomersByRevenue } from './TopCustomersByRevenue';

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

  const topByRevenue = data.top_by_revenue || [];
  const topByResources = data.top_by_resources || [];

  return (
    <>
      <SummaryWidget stats={stats} />

      <div className="mb-5">
        <CustomerAcquisitionTrendChart monthly={data.monthly || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <TopCustomersByRevenue customers={topByRevenue} />
        </div>
        <div>
          <TopCustomersByResources customers={topByResources} />
        </div>
      </div>
    </>
  );
};

export const ProviderCustomersPage: FC = () => {
  return (
    <Form onSubmit={() => {}} subscription={{ values: true }}>
      {({ values }) => {
        const providerUuid = values?.provider?.uuid;
        return (
          <>
            <ReportingTitle reportKey="provider-customers">
              <div className="flex items-center gap-3">
                <label className="text-quaternary text-xs whitespace-nowrap">
                  {translate('Provider')}:
                </label>
                <div style={{ minWidth: 200 }}>
                  <ProviderSelector />
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
      }}
    </Form>
  );
};
