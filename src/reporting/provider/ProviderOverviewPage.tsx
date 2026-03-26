import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { marketplaceServiceProvidersStatRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';

const ProviderOverviewContent: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-overview', providerUuid],
    queryFn: async () => {
      const response = await marketplaceServiceProvidersStatRetrieve({
        path: { uuid: providerUuid },
      });
      return response.data;
    },
    enabled: !!providerUuid,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  const renderValueWithChange = (value: number, change?: number) => (
    <div className="d-flex align-items-baseline gap-2">
      <span style={{ fontSize: '32px' }}>{value}</span>
      {change !== undefined && (
        <span
          className={`fs-7 fw-normal ${change >= 0 ? 'text-success' : 'text-danger'}`}
        >
          {change >= 0 ? '+' : ''}
          {change}
        </span>
      )}
    </div>
  );

  return (
    <SummaryWidget
      stats={[
        {
          label: translate('Active resources'),
          value: renderValueWithChange(
            data.active_resources,
            data.resources_number_change,
          ),
        },
        {
          label: translate('Current customers'),
          value: renderValueWithChange(
            data.current_customers,
            data.customers_number_change,
          ),
        },
        {
          label: translate('Active offerings'),
          value: data.active_and_paused_offerings,
        },
        {
          label: translate('Active campaigns'),
          value: data.active_campaigns,
        },
        {
          label: translate('Pending orders'),
          value: data.pending_orders,
        },
        {
          label: translate('Erred resources'),
          value: data.erred_resources,
        },
        {
          label: translate('Unresolved tickets'),
          value: data.unresolved_tickets,
        },
      ]}
    />
  );
};

export const ProviderOverviewPage: FC = () => {
  useTitle(translate('Provider overview'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'overview' });

  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  return (
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4 mb-6">
        <h1 className="mb-0 fs-1x">{translate('Provider overview')}</h1>
        <div className="d-none d-sm-flex gap-4">
          <ProviderFilter />
        </div>
      </div>

      {providerUuid ? (
        <ProviderOverviewContent providerUuid={providerUuid} />
      ) : (
        <NoResult
          title={translate('Select a provider')}
          message={translate(
            'Choose a provider from the dropdown above to view statistics.',
          )}
          noAction
        />
      )}
    </>
  );
};
