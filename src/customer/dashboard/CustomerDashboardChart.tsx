import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { customersUsersList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { EChart } from '@/core/EChart';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { COMMON_WIDGET_HEIGHT } from '@/dashboard/constants';
import { TeamWidget } from '@/dashboard/TeamWidget';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';
import { useCreateInvitation } from '@/invitations/actions/useCreateInvitation';
import { canViewTeam } from '@/permissions/teamVisibility';
import { Customer, User } from '@/workspace/types';

import { useCustomerCostChart, useCustomerTeamChart } from './utils';

interface CustomerDashboardProps {
  user: User;
  customer: Customer;
}

export const CustomerDashboardChart: FunctionComponent<
  CustomerDashboardProps
> = ({ customer, user }) => {
  const costChart = useCustomerCostChart(customer);

  const teamChart = useCustomerTeamChart(customer);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('organization-users');
  // The member list behind the badge needs the view-team permission.
  const canOpenTeam = canViewTeam(user, { customerId: customer.uuid });

  const { callback, canInvite, loadingProjects } = useCreateInvitation({
    roleTypes: ['customer', 'project'],
    enableBulkUpload: true,
  });

  if (costChart.isLoading || teamChart.isLoading) {
    return (
      <div className="md:col-span-2">
        <LoadingSpinner />
      </div>
    );
  } else if (costChart.error || teamChart.error) {
    return (
      <div className="md:col-span-2">
        <LoadingErred
          loadData={() => {
            costChart.refetch();
            teamChart.refetch();
          }}
        />
      </div>
    );
  }
  if (costChart.chart || teamChart.chart) {
    return (
      <>
        {Boolean(costChart.chart) && (
          <div className="mb-4" style={COMMON_WIDGET_HEIGHT}>
            <WidgetCard
              cardTitle={
                <>
                  {costChart.chart.title}
                  <small className="text-quaternary text-xs ms-3 font-normal">
                    ({translate('Current month’s cost')}:{' '}
                    {costChart.chart.current})
                  </small>
                </>
              }
              className="h-full"
            >
              <EChart options={costChart.options} />
            </WidgetCard>
          </div>
        )}
        {Boolean(teamChart.chart) && (
          <div className="mb-4" style={COMMON_WIDGET_HEIGHT}>
            <TeamWidget
              api={() =>
                customersUsersList({
                  path: { customer_uuid: customer.uuid },
                  query: {
                    field: ['uuid', 'full_name', 'email', 'role_name', 'image'],
                    page_size: 5,
                  },
                }).then(parseSelectData)
              }
              chartData={{ chart: teamChart.chart, options: teamChart.options }}
              showChart
              scope={customer}
              onBadgeClick={canOpenTeam ? goToUsers : undefined}
              onAddClick={callback}
              showAdd={canInvite}
              loadingAdd={loadingProjects}
              className="h-full"
            />
          </div>
        )}
      </>
    );
  }
  return null;
};
