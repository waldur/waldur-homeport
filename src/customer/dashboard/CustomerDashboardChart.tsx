import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
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
  const { data, isLoading, error, refetch } = useQuery(
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
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }
  if (data.costChart || data.teamChart) {
    return (
      <Row style={{ height: '18rem' }}>
        {Boolean(data.costChart) && (
          <Col md={6} sm={12} className="mb-6">
            <WidgetCard
              cardTitle={data.costChart.chart.title}
              title={data.costChart.chart.current}
              className="h-100"
              meta={
                data.costChart.chart.changes
                  ? translate(
                      '{changes} vs last month',
                      {
                        changes: (
                          <ChangesAmountBadge
                            changes={data.costChart.chart.changes}
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
              right={
                <Col xs={7}>
                  <EChart options={data.costChart.options} height="100px" />
                </Col>
              }
            />
          </Col>
        )}
        {Boolean(data.teamChart) && (
          <Col md={6} sm={12} className="mb-6">
            <TeamWidget
              api={() =>
                fetchSelectCustomerUsers(customer.uuid, { page_size: 5 })
              }
              chartData={data.teamChart}
              showChart
              scope={customer}
              onBadgeClick={goToUsers}
              onAddClick={callback}
              showAdd={canInvite}
              className="h-100"
            />
          </Col>
        )}
      </Row>
    );
  }
  return null;
};
