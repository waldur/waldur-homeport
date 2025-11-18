import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { projectsListUsersList, projectsStatsRetrieve } from 'waldur-js-client';

import { count, parseSelectData } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Panel } from '@waldur/core/Panel';
import { TruncatedMarkdown } from '@waldur/core/TruncatedMarkdown';
import { filterComponentsWithUsage } from '@waldur/customer/dashboard/utils';
import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { EditButton } from '@waldur/form/EditButton';
import { translate } from '@waldur/i18n';
import { useCreateInvitation } from '@waldur/invitations/actions/useCreateInvitation';
import { AggregateLimitWidget } from '@waldur/marketplace/aggregate-limits/AggregateLimitWidget';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectLimitUsageBasedResources } from './dashboard/ProjectLimitUsageBasedResources';
import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';
import { ProjectDashboardCredit } from './ProjectDashboardCredit';
import { getProjectTeamChart } from './utils';

const EditFieldDialog = lazyComponent(() =>
  import('./manage/EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

export const ProjectDashboard: FunctionComponent<{}> = () => {
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );

  const dispatch = useDispatch();
  const user = useUser();
  const userFromSelector = useSelector(getUser);
  const project = useSelector(getProject);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('project-users');

  const canEditProject =
    userFromSelector &&
    project &&
    (hasPermission(userFromSelector, {
      permission: PermissionEnum.UPDATE_PROJECT,
      projectId: project.uuid,
    }) ||
      hasPermission(userFromSelector, {
        permission: PermissionEnum.UPDATE_PROJECT,
        customerId: project.customer_uuid,
      }));

  const handleEditStaffNotes = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: { project, name: 'staff_notes' },
        size: 'lg',
      }),
    );
  };

  const handleEditDescription = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: { project, name: 'description' },
        size: 'lg',
      }),
    );
  };

  const { data: teamData } = useQuery({
    queryKey: ['projectTeamData', project?.uuid],
    queryFn: () => getProjectTeamChart(project),
    staleTime: 5 * 60 * 1000,
  });

  const { callback, canInvite, loadingProjects } = useCreateInvitation({
    project: project,
    roleTypes: ['project'],
  });

  const isProjectRemoved = Boolean(project?.is_removed);

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

  // Check if there are limit-based resources to show
  const { data: limitBasedResourcesCount } = useQuery({
    queryKey: ['limit-based-resources-count', project?.uuid],
    queryFn: () =>
      project?.uuid
        ? count('/api/marketplace-resources/', {
            project_uuid: project.uuid,
            state: NON_TERMINATED_STATES,
            only_limit_based: true,
            component_count: 1,
          })
        : 0,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
    enabled: Boolean(project?.uuid),
  });

  const shouldShowLimitBasedResources = (limitBasedResourcesCount || 0) > 0;

  const showBillingInfo = project.customer_display_billing_info_in_projects;

  if (!project || !user) {
    return null;
  }
  return (
    <>
      {(project.description || project.staff_notes) && (
        <Row>
          {project.description && (
            <Col
              md={project.staff_notes ? 6 : 12}
              className="mb-5"
              style={COMMON_WIDGET_HEIGHT}
            >
              <Panel
                title={translate('Description')}
                actions={
                  canEditProject && (
                    <EditButton
                      onClick={handleEditDescription}
                      size="sm"
                      tooltip={translate('Edit description')}
                    />
                  )
                }
                cardBordered
                className="h-100"
              >
                <TruncatedMarkdown
                  text={project.description}
                  title={translate('Description')}
                  maxHeight={120}
                />
              </Panel>
            </Col>
          )}
          {project.staff_notes && (user.is_staff || user.is_support) && (
            <Col
              md={project.description ? 6 : 12}
              className="mb-5"
              style={COMMON_WIDGET_HEIGHT}
            >
              <Panel
                title={
                  <>
                    {translate('Staff Notes')}{' '}
                    <Badge variant="warning" pill outline>
                      {translate('Internal')}
                    </Badge>
                  </>
                }
                actions={
                  user.is_staff && (
                    <EditButton
                      onClick={handleEditStaffNotes}
                      size="sm"
                      tooltip={translate('Edit staff notes')}
                    />
                  )
                }
                cardBordered
                className="h-100"
              >
                <TruncatedMarkdown
                  text={project.staff_notes}
                  title={translate('Staff Notes')}
                  maxHeight={120}
                  showInternalBadge={true}
                />
              </Panel>
            </Col>
          )}
        </Row>
      )}
      {shouldShowLimitBasedResources && <ProjectLimitUsageBasedResources />}
      <Row>
        {!shouldConcealPrices && showBillingInfo && (
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
            onBadgeClick={isProjectRemoved ? undefined : goToUsers}
            onAddClick={isProjectRemoved ? undefined : callback}
            showAdd={canInvite && !isProjectRemoved}
            loadingAdd={loadingProjects}
            className="h-100"
            nameKey="user_full_name"
            emailKey="user_email"
            imageKey="user_image"
          />
        </Col>
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
        {showBillingInfo && (
          <ProjectDashboardCredit project={project} className="mb-5" />
        )}
      </Row>
    </>
  );
};
