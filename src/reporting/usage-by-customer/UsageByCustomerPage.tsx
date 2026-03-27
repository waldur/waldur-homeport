import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { UsageByCustomerSummaryCards } from './UsageByCustomerSummaryCards';
import { UsageByCustomerTable } from './UsageByCustomerTable';
import { useUsageByCustomer } from './useUsageByCustomer';

export const UsageByCustomerPage: FC = () => {
  const {
    data,
    summary,
    isLoading,
    error,
    refetch,
    componentTypes,
    limitNames,
  } = useUsageByCustomer();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!data || data.length === 0 || !summary) {
    return (
      <NoResult
        title={translate('No data found')}
        message={translate(
          'There is no resource usage data by customer to display.',
        )}
        noAction
      />
    );
  }

  return (
    <>
      <ReportingTitle reportKey="usage-by-customer" />
      <UsageByCustomerSummaryCards summary={summary} />
      <UsageByCustomerTable
        data={data}
        componentTypes={componentTypes}
        limitNames={limitNames}
      />
    </>
  );
};
