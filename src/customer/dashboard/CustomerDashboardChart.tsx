import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col } from 'react-bootstrap';
import { customersUsersList } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';
import { useCreateInvitation } from '@waldur/invitations/actions/useCreateInvitation';
import { Customer, User } from '@waldur/workspace/types';

import { useCustomerCostChart, useCustomerTeamChart } from './utils';

interface CustomerDashboardProps {
  user: User;
  customer: Customer;
}

export const CustomerDashboardChart: FunctionComponent<
  CustomerDashboardProps
> = ({ customer }) => {
  const costChart = useCustomerCostChart(customer);

  const teamChart = useCustomerTeamChart(customer);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('organization-users');

  const { callback, canInvite } = useCreateInvitation({
    roleTypes: ['customer', 'project'],
    enableBulkUpload: true,
  });

  if (costChart.isLoading || teamChart.isLoading) {
    return <LoadingSpinner />;
  } else if (costChart.error || teamChart.error) {
    return (
      <LoadingErred
        loadData={() => {
          costChart.refetch();
          teamChart.refetch();
        }}
      />
    );
  }
  if (costChart.chart || teamChart.chart) {
    return (
      <>
        {Boolean(costChart.chart) && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <WidgetCard
              cardTitle={
                <>
                  {costChart.chart.title}
                  <small className="text-muted fs-7 ms-4 fw-normal">
                    ({translate('Current month’s cost')}:{' '}
                    {costChart.chart.current})
                  </small>
                </>
              }
              className="h-100"
            >
              <EChart options={costChart.options} />
            </WidgetCard>
          </Col>
        )}
        {Boolean(teamChart.chart) && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <TeamWidget
              api={() =>
                customersUsersList({
                  path: { uuid: customer.uuid },
                  query: {
                    field: ['uuid', 'full_name', 'email', 'role_name', 'image'],
                    page_size: 5,
                  },
                }).then(parseSelectData)
              }
              chartData={{ chart: teamChart.chart, options: teamChart.options }}
              showChart
              scope={customer}
              onBadgeClick={goToUsers}
              onAddClick={callback}
              showAdd={canInvite}
              className="h-100"
            />
          </Col>
        )}
      </>
    );
  }
  return null;
};
