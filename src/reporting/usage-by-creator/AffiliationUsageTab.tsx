import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { AffiliationUsageSummaryCards } from './AffiliationUsageSummaryCards';
import { AffiliationUsageTable } from './AffiliationUsageTable';
import { useUsageByAffiliation } from './useUsageByCreator';

export const AffiliationUsageTab: FC = () => {
  const { data, summary, isLoading, error, refetch, componentTypes } =
    useUsageByAffiliation();

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
          'There is no resource usage data by affiliation to display.',
        )}
        noAction
      />
    );
  }

  return (
    <>
      <AffiliationUsageSummaryCards summary={summary} />
      <AffiliationUsageTable data={data} componentTypes={componentTypes} />
    </>
  );
};
