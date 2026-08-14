import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { customersStatsRetrieve } from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { COMMON_WIDGET_HEIGHT } from '@/dashboard/constants';
import { AggregateLimitWidget } from '@/marketplace/aggregate-limits/AggregateLimitWidget';
import { UsageViewsSection } from '@/marketplace/aggregate-limits/usage-views/UsageViewsSection';
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

  const {
    data: aggregateLimitData,
    isLoading: isAggregateLimitLoading,
    error: aggregateLimitError,
    refetch: aggregateLimitRefetch,
  } = useQuery({
    queryKey: ['customer-stats', customer?.uuid],

    queryFn: () =>
      customersStatsRetrieve({ path: { uuid: customer?.uuid } }).then(
        (r) => r.data,
      ),

    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const {
    data: aggregateLimitDataForCurrentMonth,
    isLoading: isAggregateLimitLoadingForCurrentMonth,
    error: aggregateLimitErrorForCurrentMonth,
    refetch: aggregateLimitRefetchForCurrentMonth,
  } = useQuery({
    queryKey: ['customer-stats', customer?.uuid, 'current-month'],

    queryFn: () =>
      customersStatsRetrieve({
        path: { uuid: customer?.uuid },
        query: { for_current_month: true },
      }).then((r) => r.data),

    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const currentMonthFilteredData = filterComponentsWithUsage(
    aggregateLimitDataForCurrentMonth,
  );

  const shouldShowAggregateLimitWidget =
    aggregateLimitData?.components?.length > 0;

  const shouldShowCurrentMonthWidget =
    currentMonthFilteredData?.components?.length > 0;

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
          {shouldShowCurrentMonthWidget && (
            <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
              <AggregateLimitWidget
                customer={customer}
                data={currentMonthFilteredData}
                isLoading={isAggregateLimitLoadingForCurrentMonth}
                error={aggregateLimitErrorForCurrentMonth}
                refetch={aggregateLimitRefetchForCurrentMonth}
                type="monthly"
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
              />
            </Col>
          )}
          {Boolean(customer.credit) && (
            <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
              <CustomerDashboardCredit customer={customer} />
            </Col>
          )}
          <Col xs={12}>
            <UsageViewsSection customer={customer} />
          </Col>
          <Col xs={12}>
            <ProjectsList customer={customer} />
          </Col>
        </Row>
      )}
    </>
  );
};
