import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';
import { OrdersContent } from '@waldur/reporting/orders/OrdersContent';
import { OrdersFilter } from '@waldur/reporting/orders/OrdersFilter';
import { useOrdersStats } from '@waldur/reporting/orders/useOrdersStats';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';

export const ProviderOrdersPage: FC = () => {
  useTitle(translate('Provider orders'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'orders' });

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
    <FormGroup label={translate('Provider')} className="flex-grow-1 mw-300px">
      <ProviderFilter />
    </FormGroup>
  );

  return (
    <>
      <OrdersFilter
        days={days}
        onDaysChange={setDays}
        extraFilters={providerFilter}
      />

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
