import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplaceServiceProvidersStatRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

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
  return (
    <Form onSubmit={() => {}} subscription={{ values: true }}>
      {({ values }) => {
        const providerUuid = values?.provider?.uuid;
        return (
          <>
            <ReportingTitle reportKey="provider-overview">
              <ProviderFilter />
            </ReportingTitle>

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
      }}
    </Form>
  );
};
