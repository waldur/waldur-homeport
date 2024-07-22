import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { useCreateInvitation } from '@waldur/invitations/actions/hooks';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';
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

  const router = useRouter();
  const goToUsers = () => router.stateService.go('organization-users');

  const { callback, canInvite } = useCreateInvitation({
    roleTypes: ['customer', 'project'],
    enableBulkUpload: true,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (Array.isArray(data)) {
    return (
      <Row>
        {data.map((item, index) => (
          <Col key={index} md={6} sm={12} className="mb-6">
            <WidgetCard
              cardTitle={item.chart.title}
              title={item.chart.current}
              className="h-100"
              meta={
                item.chart.changes
                  ? translate(
                      '{changes} vs last month',
                      {
                        changes: (
                          <ChangesAmountBadge
                            changes={item.chart.changes}
                            showOnInfinity
                            showOnZero
                            asBadge={false}
                          />
                        ),
                      },
                      formatJsxTemplate,
                    )
                  : null
              }
            >
              <Col xs={7}>
                <EChart options={item.options} height="100px" />
              </Col>
            </WidgetCard>
          </Col>
        ))}
        <Col md={6} sm={12} className="mb-6">
          <TeamWidget
            api={() =>
              fetchSelectCustomerUsers(customer.uuid, { page_size: 5 })
            }
            scope={customer}
            changes={null}
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
