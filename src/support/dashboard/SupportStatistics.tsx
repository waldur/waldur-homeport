import { useQuery } from '@tanstack/react-query';
import { supportStatisticsRetrieve } from 'waldur-js-client';

import { StatCardGrid } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ViewAllLink } from '@/core/ViewAllLink';
import { translate } from '@/i18n';
import { IsOpenOptions } from '@/table/generated/SupportIssuesFilter';

/**
 * Link to the request list under the same open/closed definition the counter
 * above it uses. This used to serialise an *array* of status options into the
 * single-select status filter, which keeps only the first of them — so the
 * "Open issues" card landed on a "Waiting for support" filter showing nothing.
 */
const getIssueState = (isOpen: boolean) => ({
  state: 'support-list',
  params: {
    is_open: JSON.stringify(IsOpenOptions.find((op) => op.value === isOpen)),
  },
});

export const SupportStatistics = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['support-statistics'],
    queryFn: () => supportStatisticsRetrieve().then((r) => r.data),
    staleTime: STALE_TIME,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load statistics data')}
        loadData={refetch}
        className="mb-3"
      />
    );
  }
  if (!data) {
    return null;
  }
  return (
    <StatCardGrid
      stats={[
        {
          label: translate('Open issues'),
          value: data.open_issues_count,
          footer: <ViewAllLink to={getIssueState(true)} />,
        },
        {
          label: translate('Closed issues (this month)'),
          value: data.closed_this_month_count,
          footer: <ViewAllLink to={getIssueState(false)} />,
        },
        {
          label: translate('Recent broadcasts (this month)'),
          value: data.recent_broadcasts_count,
          footer: <ViewAllLink to={{ state: 'support-broadcast' }} />,
        },
      ]}
    />
  );
};
