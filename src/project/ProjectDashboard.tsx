import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useCreateInvitation } from '@waldur/invitations/actions/hooks';
import { AggregateLimitWidget } from '@waldur/marketplace/aggregate-limits/AggregateLimitWidget';
import { getProjectStats } from '@waldur/marketplace/aggregate-limits/api';
import { fetchSelectProjectUsers } from '@waldur/permissions/api';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';
import { getProjectTeamChart } from './utils';

const shouldShowAggregateLimitWidget = (uuid) => {
  const { data } = useQuery(
    ['project-stats', uuid],
    () => getProjectStats(uuid),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 },
  );

  return data?.data.components?.length > 0;
};

export const ProjectDashboard: FunctionComponent<{}> = () => {
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, MarketplaceFeatures.conceal_prices),
  );

  const user = useSelector(getUser);
  const project = useSelector(getProject);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('project-users');

  const { data: teamData } = useQuery(
    ['projectTeamData', project?.uuid],
    async () => await getProjectTeamChart(project),
    { staleTime: 5 * 60 * 1000 },
  );

  const { callback, canInvite } = useCreateInvitation({
    project: project,
    roleTypes: ['project'],
  });

  if (!project || !user) {
    return null;
  }
  return (
    <>
      <Row style={{ height: '18rem' }}>
        {!shouldConcealPrices && (
          <Col md={6} sm={12} className="mb-6">
            <ProjectDashboardCostLimits project={project} />
          </Col>
        )}
        <Col md={6} sm={12} className="mb-6">
          <TeamWidget
            api={() => fetchSelectProjectUsers(project.uuid, { page_size: 5 })}
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
      {shouldShowAggregateLimitWidget(project.uuid) && (
        <Row style={{ height: '18rem' }}>
          <Col md={6} sm={12} className="mb-6">
            <AggregateLimitWidget project={project} />
          </Col>
        </Row>
      )}
      {project.description ? (
        <Panel title={translate('Description')}>
          <p>{project.description}</p>
        </Panel>
      ) : null}
    </>
  );
};
