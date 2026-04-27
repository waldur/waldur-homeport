import { FC } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { UsageByOrgTypeSummaryCards } from '../usage-by-org-type/UsageByOrgTypeSummaryCards';
import { UsageByOrgTypeTable } from '../usage-by-org-type/UsageByOrgTypeTable';
import { useUsageByOrgType } from '../usage-by-org-type/useUsageByOrgType';

export const OrgTypeUsageTab: FC = () => {
  const { data, summary, isLoading, error, refetch, componentTypes } =
    useUsageByOrgType();

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
          'There is no resource usage data by organization type to display.',
        )}
        noAction
      />
    );
  }

  return (
    <>
      <UsageByOrgTypeSummaryCards summary={summary} />
      <UsageByOrgTypeTable data={data} componentTypes={componentTypes} />
    </>
  );
};
