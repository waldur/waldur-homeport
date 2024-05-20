import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getDailyQuotasOfCurrentMonth } from '@waldur/dashboard/api';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { useCreateInvitation } from '@waldur/invitations/actions/hooks';
import { fetchSelectCustomerUsers } from '@waldur/permissions/api';
import { Customer, User } from '@waldur/workspace/types';

import { loadSummary } from './api';

interface CustomerDashboardProps {
  user: User;
  customer: Customer;
}

export const CustomerDashboardChart: FunctionComponent<
  CustomerDashboardProps
> = ({ customer }) => {
  const { data, isLoading } = useQuery(
    ['customerDashboardCharts', customer.uuid],
    () => loadSummary(customer),
    { staleTime: 5 * 60 * 1000 },
  );
  const { data: changes, refetch: refetchChanges } = useQuery(
    ['customerTeamChanges', customer.uuid],
    async () => {
      const dailyQuotas = await getDailyQuotasOfCurrentMonth(
        'nc_user_count',
        customer,
      );
      return dailyQuotas.reduce((v, acc) => acc + v, 0);
    },
    { staleTime: 5 * 60 * 1000 },
  );

  const router = useRouter();
  const goToUsers = () => router.stateService.go('organization-users');

  const { callback, canInvite } = useCreateInvitation({
    roleTypes: ['customer', 'project'],
    refetch: refetchChanges,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (Array.isArray(data)) {
    return (
      <Row>
        {data.map((item, index) => (
          <Col key={index} md={6} sm={12} className="mb-6">
            <Card className="h-100">
              <Card.Body>
                <Row>
                  <Col xs={7}>
                    <EChart options={item.options} height="100px" />
                  </Col>
                  <Col>
                    <h1 className="fw-bold">{item.chart.current}</h1>
                    <h5 className="fw-bold text-uppercase">
                      {item.chart.title}
                    </h5>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
        <Col md={6} sm={12} className="mb-6">
          <TeamWidget
            api={() =>
              fetchSelectCustomerUsers(customer.uuid, { page_size: 5 })
            }
            changes={changes}
            onBadgeClick={goToUsers}
            onAddClick={callback}
            showAdd={canInvite}
            className="h-100"
          />
        </Col>
      </Row>
    );
  }
  return null;
};
