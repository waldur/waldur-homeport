import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { AggregateLimitWidget } from '@waldur/marketplace/aggregate-limits/AggregateLimitWidget';
import { getCustomerStats } from '@waldur/marketplace/aggregate-limits/api';
import { ProjectsList } from '@waldur/project/ProjectsList';
import {
  checkIsServiceManager,
  getCustomer,
  getUser,
  isOwnerOrStaff,
} from '@waldur/workspace/selectors';

import { CreditStatusWidget } from './CreditStatusWidget';
import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerProfile } from './CustomerProfile';

const shouldShowAggregateLimitWidget = (uuid) => {
  const { data } = useQuery(
    ['customer-stats', uuid],
    () => getCustomerStats(uuid),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 },
  );

  return data?.data.components?.length > 0;
};

export const CustomerDashboard: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );
  const canSeeCharts = useSelector(isOwnerOrStaff);

  if (!customer) return null;

  return (
    <>
      {isServiceManager ? (
        <CustomerProfile customer={customer} />
      ) : (
        <>
          {canSeeCharts && (
            <CustomerDashboardChart customer={customer} user={user} />
          )}
          {(shouldShowAggregateLimitWidget(customer.uuid) ||
            Boolean(customer.credit)) && (
            <Row style={{ height: '18rem' }}>
              <Col md={6} sm={12} className="mb-6">
                <AggregateLimitWidget customer={customer} />
              </Col>
              {Boolean(customer.credit) && (
                <Col md={6} sm={12} className="mb-6">
                  <CreditStatusWidget customer={customer} />
                </Col>
              )}
            </Row>
          )}
          <div className="mb-6">
            <ProjectsList />
          </div>
        </>
      )}
    </>
  );
};
