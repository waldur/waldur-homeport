import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceServiceProvidersRevenueList,
  ServiceProviderRevenues,
} from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

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
      return response.data as ServiceProviderRevenues[];
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
  useTitle(translate('Provider revenue'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'revenue' });

  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  return (
    <>
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Provider')}
          className="flex-grow-1 mw-300px"
        >
          <ProviderFilter />
        </FormGroup>
      </div>

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
};
