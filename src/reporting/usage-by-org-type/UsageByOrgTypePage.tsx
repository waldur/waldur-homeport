import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { UsageByOrgTypeSummaryCards } from './UsageByOrgTypeSummaryCards';
import { UsageByOrgTypeTable } from './UsageByOrgTypeTable';
import { useUsageByOrgType } from './useUsageByOrgType';

export const UsageByOrgTypePage: FC = () => {
  useTitle(translate('Usage by organization type'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'usage-by-org-type',
  });

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
