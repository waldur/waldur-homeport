import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { projectsListUsersList, projectsStatsRetrieve } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { Panel } from '@waldur/core/Panel';
import { filterComponentsWithUsage } from '@waldur/customer/dashboard/utils';
import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useCreateInvitation } from '@waldur/invitations/actions/useCreateInvitation';
import { AggregateLimitWidget } from '@waldur/marketplace/aggregate-limits/AggregateLimitWidget';
import { useUser } from '@waldur/workspace/hooks';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';
import { ProjectDashboardCredit } from './ProjectDashboardCredit';
import { getProjectTeamChart } from './utils';

export const ProjectDashboard: FunctionComponent<{}> = () => {
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );

  const user = useUser();
  const project = useSelector(getProject);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('project-users');

  const { data: teamData } = useQuery({
    queryKey: ['projectTeamData', project?.uuid],
    queryFn: () => getProjectTeamChart(project),
    staleTime: 5 * 60 * 1000,
  });

  const { callback, canInvite } = useCreateInvitation({
    project: project,
    roleTypes: ['project'],
  });

  const {
    data: aggregateLimitData,
    isLoading: isAggregateLimitLoading,
    error: aggregateLimitError,
    refetch: aggregateLimitRefetch,
  } = useQuery({
    queryKey: ['project-stats', project?.uuid],

    queryFn: () =>
      projectsStatsRetrieve({ path: { uuid: project?.uuid } }).then(
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
    queryKey: ['project-stats', project?.uuid, 'current-month'],

    queryFn: () =>
      projectsStatsRetrieve({
        path: { uuid: project?.uuid },
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

  if (!project || !user) {
    return null;
  }
  return (
    <>
      <Row>
        {!shouldConcealPrices && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <ProjectDashboardCostLimits project={project} />
          </Col>
        )}
        <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
          <TeamWidget
            api={() =>
              projectsListUsersList({
                path: { uuid: project.uuid },
                query: {
                  field: [
                    'user_uuid',
                    'user_full_name',
                    'user_email',
                    'user_image',
                    'role_name',
                  ],

                  page_size: 5,
                },
              }).then(parseSelectData)
            }
            scope={project}
            chartData={teamData}
            showChart
            onBadgeClick={goToUsers}
            onAddClick={callback}
            showAdd={canInvite}
            className="h-100"
            nameKey="user_full_name"
            emailKey="user_email"
            imageKey="user_image"
          />
        </Col>
      </Row>
      <Row>
        {shouldShowCurrentMonthWidget && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <AggregateLimitWidget
              project={project}
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
              project={project}
              data={aggregateLimitData}
              isLoading={isAggregateLimitLoading}
              error={aggregateLimitError}
              refetch={aggregateLimitRefetch}
            />
          </Col>
        )}
        <ProjectDashboardCredit project={project} className="mb-5" />
      </Row>

      {project.description ? (
        <Panel title={translate('Description')} cardBordered>
          <p>{project.description}</p>
        </Panel>
      ) : null}
    </>
  );
};
