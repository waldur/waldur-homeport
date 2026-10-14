import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
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
  checkIsServiceManager,
  checkIsOwnerOrStaff,
} from '@/workspace/selectors';

import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerDashboardCredit } from './CustomerDashboardCredit';
import { CustomerProfile } from './CustomerProfile';
import { filterComponentsWithUsage } from './utils';

export const CustomerDashboard: FunctionComponent = () => {
  const user = useUser();
  const customer = useCustomer();
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );
  const canSeeCharts = useMemo(
    () => checkIsOwnerOrStaff(customer, user),
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

  if (!customer) return null;

  return (
    <>
      {isServiceManager ? (
        <CustomerProfile customer={customer} />
      ) : (
        <Row>
          {canSeeCharts && (
            <CustomerDashboardChart customer={customer} user={user} />
          )}
          {showTerminatedSwitch && (
            <Col
              xs={12}
              className="d-flex flex-wrap align-items-center justify-content-end gap-3 mb-5"
            >
              {includeTerminated && (
                <span className="text-quaternary fs-7">
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
            </Col>
          )}
          {shouldShowCurrentMonthWidget && (
            <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
              <AggregateLimitWidget
                customer={customer}
                data={currentMonthFilteredData}
                isLoading={isAggregateLimitLoadingForCurrentMonth}
                error={aggregateLimitErrorForCurrentMonth}
                refetch={aggregateLimitRefetchForCurrentMonth}
                type="monthly"
                includeTerminated={includeTerminated}
              />
            </Col>
          )}
          {shouldShowAggregateLimitWidget && (
            <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
              <AggregateLimitWidget
                customer={customer}
                data={aggregateLimitData}
                isLoading={isAggregateLimitLoading}
                error={aggregateLimitError}
                refetch={aggregateLimitRefetch}
                includeTerminated={includeTerminated}
              />
            </Col>
          )}
          {Boolean(customer.credit) && (
            <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
              <CustomerDashboardCredit customer={customer} />
            </Col>
          )}
          <Col xs={12}>
            <UsageViewsSection
              customer={customer}
              includeTerminated={includeTerminated}
            />
          </Col>
          <Col xs={12}>
            <ProjectsList customer={customer} />
          </Col>
        </Row>
      )}
    </>
  );
};
