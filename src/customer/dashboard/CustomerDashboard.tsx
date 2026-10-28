import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo, useState } from 'react';
import { customersStatsRetrieve } from 'waldur-js-client';

import { Switch } from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { COMMON_WIDGET_HEIGHT } from '@/dashboard/constants';
import { isFeatureVisible } from '@/features/connect';
import { DashboardFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { AggregateLimitWidget } from '@/marketplace/aggregate-limits/AggregateLimitWidget';
import {
  UsageViewsSection,
  hasVisibleUsageViews,
} from '@/marketplace/aggregate-limits/usage-views/UsageViewsSection';
import { ProjectsList } from '@/project/ProjectsList';
import { useUser, useCustomer } from '@/workspace/hooks';
import {
  checkCanViewAccounting,
  checkIsServiceManagerOnly,
} from '@/workspace/selectors';

import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerDashboardCredit } from './CustomerDashboardCredit';
import { filterComponentsWithUsage } from './utils';

export const CustomerDashboard: FunctionComponent = () => {
  const user = useUser();
  const customer = useCustomer();
  // The page hero above already shows the organization's profile. A user who
  // reaches the organization only through its service provider gets nothing
  // more; staff and members who also manage the provider get the full view.
  const isServiceManagerOnly = checkIsServiceManagerOnly(customer);
  const canSeeCharts = useMemo(
    () => checkCanViewAccounting(customer, user),
    [customer, user],
  );
  const [includeTerminated, setIncludeTerminated] = useState(false);

  const {
    data: aggregateLimitData,
    isLoading: isAggregateLimitLoading,
    error: aggregateLimitError,
    refetch: aggregateLimitRefetch,
  } = useQuery({
    queryKey: ['customer-stats', customer?.uuid, includeTerminated],

    queryFn: () =>
      customersStatsRetrieve({
        path: { uuid: customer?.uuid },
        query: { include_terminated: includeTerminated },
      }).then((r) => r.data),

    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  const {
    data: aggregateLimitDataForCurrentMonth,
    isLoading: isAggregateLimitLoadingForCurrentMonth,
    error: aggregateLimitErrorForCurrentMonth,
    refetch: aggregateLimitRefetchForCurrentMonth,
  } = useQuery({
    queryKey: [
      'customer-stats',
      customer?.uuid,
      'current-month',
      includeTerminated,
    ],

    queryFn: () =>
      customersStatsRetrieve({
        path: { uuid: customer?.uuid },
        query: {
          for_current_month: true,
          include_terminated: includeTerminated,
        },
      }).then((r) => r.data),

    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  const currentMonthFilteredData = filterComponentsWithUsage(
    aggregateLimitDataForCurrentMonth,
  );

  const shouldShowAggregateLimitWidget =
    aggregateLimitData?.components?.length > 0;

  const shouldShowCurrentMonthWidget =
    currentMonthFilteredData?.components?.length > 0;

  // The switch only changes the usage charts, so it shows with them. While it
  // is on it stays, so a switch that emptied nothing can still be turned off.
  const showTerminatedSwitch =
    isFeatureVisible(DashboardFeatures.usage_include_terminated) &&
    (includeTerminated ||
      shouldShowAggregateLimitWidget ||
      shouldShowCurrentMonthWidget ||
      hasVisibleUsageViews());

  if (!customer || isServiceManagerOnly) return null;

  return (
    <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
      {canSeeCharts && (
        <CustomerDashboardChart customer={customer} user={user} />
      )}
      {showTerminatedSwitch && (
        <div className="flex flex-wrap items-center justify-end gap-2.5 mb-4 md:col-span-2">
          {includeTerminated && (
            <span className="text-quaternary text-xs">
              {translate(
                "Terminated resources' usage is shown separately and does not count against limits: for the current month in the usage widgets, and for each offering's limit period in the per-offering views.",
              )}
            </span>
          )}
          <Switch
            checked={includeTerminated}
            onCheckedChange={setIncludeTerminated}
            size="sm"
            label={translate('Include terminated resources')}
          />
        </div>
      )}
      {shouldShowCurrentMonthWidget && (
        <div className="mb-4" style={COMMON_WIDGET_HEIGHT}>
          <AggregateLimitWidget
            customer={customer}
            data={currentMonthFilteredData}
            isLoading={isAggregateLimitLoadingForCurrentMonth}
            error={aggregateLimitErrorForCurrentMonth}
            refetch={aggregateLimitRefetchForCurrentMonth}
            type="monthly"
            includeTerminated={includeTerminated}
          />
        </div>
      )}
      {shouldShowAggregateLimitWidget && (
        <div className="mb-4" style={COMMON_WIDGET_HEIGHT}>
          <AggregateLimitWidget
            customer={customer}
            data={aggregateLimitData}
            isLoading={isAggregateLimitLoading}
            error={aggregateLimitError}
            refetch={aggregateLimitRefetch}
            includeTerminated={includeTerminated}
          />
        </div>
      )}
      {Boolean(customer.credit) && (
        <div className="mb-4" style={COMMON_WIDGET_HEIGHT}>
          <CustomerDashboardCredit customer={customer} />
        </div>
      )}
      <div className="md:col-span-2">
        <UsageViewsSection
          customer={customer}
          includeTerminated={includeTerminated}
        />
      </div>
      <div className="md:col-span-2">
        <ProjectsList customer={customer} />
      </div>
    </div>
  );
};
