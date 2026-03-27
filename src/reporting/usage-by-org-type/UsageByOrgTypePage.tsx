import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { UsageByOrgTypeSummaryCards } from './UsageByOrgTypeSummaryCards';
import { UsageByOrgTypeTable } from './UsageByOrgTypeTable';
import { useUsageByOrgType } from './useUsageByOrgType';

export const UsageByOrgTypePage: FC = () => {
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
      <>
        <ReportingTitle reportKey="usage-by-org-type" />
        <NoResult
          title={translate('No data found')}
          message={translate(
            'There is no resource usage data by organization type to display.',
          )}
          noAction
        />
      </>
    );
  }

  return (
    <>
      <ReportingTitle reportKey="usage-by-org-type" />
      <UsageByOrgTypeSummaryCards summary={summary} />
      <UsageByOrgTypeTable data={data} componentTypes={componentTypes} />
    </>
  );
};
