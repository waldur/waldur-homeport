import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { customersStatsRetrieve } from 'waldur-js-client';

import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { AggregateLimitWidget } from '@waldur/marketplace/aggregate-limits/AggregateLimitWidget';
import { ProjectsList } from '@waldur/project/ProjectsList';
import {
  checkIsServiceManager,
  getCustomer,
  getUser,
  isOwnerOrStaff,
} from '@waldur/workspace/selectors';

import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerDashboardCredit } from './CustomerDashboardCredit';
import { CustomerProfile } from './CustomerProfile';
import { filterComponentsWithUsage } from './utils';

export const CustomerDashboard: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );
  const canSeeCharts = useSelector(isOwnerOrStaff);

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
    staleTime: 60 * 1000,
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
    staleTime: 60 * 1000,
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
            <ProjectsList customer={customer} />
          </Col>
        </Row>
      )}
    </>
  );
};
