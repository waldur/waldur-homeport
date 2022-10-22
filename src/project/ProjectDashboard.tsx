import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ProjectResourcesFilter } from '@waldur/project/ProjectResourcesFilter';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectDashboardChart } from './ProjectDashboardChart';
import { ProjectProfile } from './ProjectProfile';
import { ProjectResourcesList } from './ProjectResourcesList';
import { ShortEventsList } from './ShortEventsList';

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
            <ProjectDashboardChart project={project} />
          </Col>
          <Col md={6} sm={12} className="mb-md-0 mb-sm-6">
            <ShortEventsList project={project} />
          </Col>
        </Row>
      )}
      <ProjectResourcesList filters={<ProjectResourcesFilter />} />
    </>
  );
};
