import { ErrorBoundary } from '@sentry/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ErrorMessage } from '@waldur/ErrorMessage';
import { ProjectResourcesAllList } from '@waldur/marketplace/resources/list/ProjectResourcesAllList';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';
import { ProjectEventsTimeline } from './ProjectEventsTimeline';
import { ProjectProfile } from './ProjectProfile';

export const ProjectDashboard: FunctionComponent<{}> = () => {
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, 'marketplace.conceal_prices'),
  );

  const user = useSelector(getUser);
  const project = useSelector(getProject);

  if (!project) {
    return null;
  }
  if (!user) {
    return null;
  }
  return (
    <>
      <ProjectProfile project={project} />
      {!shouldConcealPrices && (
        <Row className="mb-6">
          <Col md={6} sm={12} className="mb-md-0 mb-sm-6">
            <ProjectDashboardCostLimits project={project} />
          </Col>
          <Col md={6} sm={12} className="mb-md-0 mb-sm-6">
            <ErrorBoundary fallback={ErrorMessage}>
              <ProjectEventsTimeline project={project} />
            </ErrorBoundary>
          </Col>
        </Row>
      )}
      <ProjectResourcesAllList />
    </>
  );
};
