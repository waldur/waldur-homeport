import { ErrorBoundary } from '@sentry/react';
import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';
import { ProjectResourcesFilter } from '@waldur/project/ProjectResourcesFilter';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectDashboardChart } from './ProjectDashboardChart';
import { ProjectEventsTimeline } from './ProjectEventsTimeline';
import { ProjectOrderItemsList } from './ProjectOrderItemsList';
import { ProjectProfile } from './ProjectProfile';
import { ProjectResourcesList } from './ProjectResourcesList';

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
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Row className="mb-10">
                  <ProjectDashboardChart project={project} />
                </Row>
                <Row className="flex-grow-1">
                  <Col>
                    <div className="d-flex flex-column justify-content-between h-100">
                      <ProjectOrderItemsList />
                      <div className="text-end">
                        <Link
                          state="marketplace-order-list"
                          params={{ uuid: project.uuid }}
                          className="btn btn-light btn-sm min-w-100px"
                        >
                          {translate('Billing')}
                        </Link>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} sm={12} className="mb-md-0 mb-sm-6">
            <ErrorBoundary fallback={ErrorMessage}>
              <ProjectEventsTimeline project={project} />
            </ErrorBoundary>
          </Col>
        </Row>
      )}
      <ProjectResourcesList filters={<ProjectResourcesFilter />} />
    </>
  );
};
