import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { getDailyQuotasOfCurrentMonth } from '@waldur/dashboard/api';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useCreateInvitation } from '@waldur/invitations/actions/hooks';
import { fetchSelectProjectUsers } from '@waldur/permissions/api';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';

export const ProjectDashboard: FunctionComponent<{}> = () => {
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, MarketplaceFeatures.conceal_prices),
  );

  const user = useSelector(getUser);
  const project = useSelector(getProject);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('project-users');

  const { data: changes, refetch: refetchChanges } = useQuery(
    ['projectTeamChanges', project?.uuid],
    async () => {
      const dailyQuotas = await getDailyQuotasOfCurrentMonth(
        'nc_user_count',
        project,
      );
      return dailyQuotas.reduce((v, acc) => acc + v, 0);
    },
    { staleTime: 5 * 60 * 1000 },
  );

  const { callback, canInvite } = useCreateInvitation({
    project: project,
    roleTypes: ['project'],
    refetch: refetchChanges,
  });

  if (!project || !user) {
    return null;
  }
  return (
    <>
      <Row>
        {!shouldConcealPrices && (
          <Col md={6} sm={12} className="mb-6">
            <ProjectDashboardCostLimits project={project} />
          </Col>
        )}
        <Col md={6} sm={12} className="mb-6">
          <TeamWidget
            api={() => fetchSelectProjectUsers(project.uuid, { page_size: 5 })}
            scope={project}
            changes={changes}
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
      {project.description ? (
        <Panel title={translate('Description')}>
          <p className="text-pre text-muted">{project.description}</p>
        </Panel>
      ) : null}
    </>
  );
};
