import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { OrdersContent } from '@/reporting/orders/OrdersContent';
import { OrdersFilter } from '@/reporting/orders/OrdersFilter';
import { useOrdersStats } from '@/reporting/orders/useOrdersStats';

import { ReportingTitle } from '../ReportingTitle';

import { ProviderFilter } from './ProviderFilter';

export const ProviderOrdersPage: FC = () => {
  const [days, setDays] = useState(30);
  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  const { isLoading, error, refetch, data } = useOrdersStats({
    days,
    provider_uuid: providerUuid,
  });

  const providerFilter = (
    <div className="d-flex align-items-center gap-4">
      <label className="text-muted fs-7 fw-semibold whitespace-nowrap">
        {translate('Provider')}:
      </label>
      <div style={{ minWidth: 200 }}>
        <ProviderFilter />
      </div>
    </div>
  );

  return (
    <>
      <ReportingTitle reportKey="provider-orders">
        <OrdersFilter
          days={days}
          onDaysChange={setDays}
          extraFilters={providerFilter}
        />
      </ReportingTitle>

      {!providerUuid ? (
        <NoResult
          title={translate('Select a provider')}
          message={translate(
            'Choose a provider from the dropdown above to view order statistics.',
          )}
          noAction
        />
      ) : isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : data ? (
        <OrdersContent data={data} />
      ) : (
        <NoResult
          title={translate('No data available')}
          message={translate(
            'No order statistics found for the selected provider and period.',
          )}
          noAction
        />
      )}
    </>
  );
};
