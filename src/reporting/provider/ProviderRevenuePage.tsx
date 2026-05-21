import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { marketplaceServiceProvidersRevenueList } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { ProviderFilter } from './ProviderFilter';
import { ProviderRevenueChart } from './ProviderRevenueChart';

const ProviderRevenueContent: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-revenue', providerUuid],
    queryFn: async () => {
      const response = await marketplaceServiceProvidersRevenueList({
        path: { uuid: providerUuid },
      });
      return response.data;
    },
    enabled: !!providerUuid,
  });

  const totalRevenue = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, d) => sum + (d.total || 0), 0);
  }, [data]);

  const avgMonthlyRevenue = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return totalRevenue / data.length;
  }, [data, totalRevenue]);

  const stats = useMemo(
    () => [
      {
        label: translate('Total revenue (12 months)'),
        value: defaultCurrency(totalRevenue),
      },
      {
        label: translate('Average monthly'),
        value: defaultCurrency(avgMonthlyRevenue),
      },
    ],
    [totalRevenue, avgMonthlyRevenue],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Body>
          <NoResult
            title={translate('No data available')}
            message={translate('No revenue data available for this provider.')}
            callback={refetch}
            buttonTitle={translate('Retry')}
          />
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <SummaryWidget stats={stats} />
      <ProviderRevenueChart data={data} />
    </>
  );
};

export const ProviderRevenuePage: FC = () => {
  return (
    <Form onSubmit={() => {}} subscription={{ values: true }}>
      {({ values }) => {
        const providerUuid = values?.provider?.uuid;
        return (
          <>
            <ReportingTitle reportKey="provider-revenue">
              <ProviderFilter />
            </ReportingTitle>

            {providerUuid ? (
              <ProviderRevenueContent providerUuid={providerUuid} />
            ) : (
              <NoResult
                title={translate('Select a provider')}
                message={translate(
                  'Choose a provider from the dropdown above to view revenue data.',
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
