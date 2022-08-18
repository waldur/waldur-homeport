import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { ProjectResourcesFilter } from '@waldur/project/ProjectResourcesFilter';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { Project, User } from '@waldur/workspace/types';

import { useProjectItems } from '../navigation/navitems';

import { InvoicesSummary } from './InvoicesSummary';
import { ProjectDashboardChart } from './ProjectDashboardChart';
import { ProjectProfile } from './ProjectProfile';
import { ProjectResourcesList } from './ProjectResourcesList';

interface ProjectDashboardProps {
  user: User;
  project: Project;
  canAddUser: boolean;
}

export const ProjectDashboard: FunctionComponent<ProjectDashboardProps> = (
  props,
) => {
  useTitle(translate('Dashboard'));
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, 'marketplace.conceal_prices'),
  );
  useProjectItems();
  if (!props.project) {
    return null;
  }
  if (!props.user) {
    return null;
  }
  return (
    <>
      <ProjectProfile project={props.project} />
      {!shouldConcealPrices && (
        <Row className="mb-6">
          <Col md={6} sm={12} className="mb-md-0 mb-sm-6">
            <ProjectDashboardChart project={props.project} />
          </Col>
          <Col md={6} sm={12} className="mb-md-0 mb-sm-6">
            <InvoicesSummary project={props.project} />
          </Col>
        </Row>
      )}
      <ProjectResourcesList filters={<ProjectResourcesFilter />} />
    </>
  );
};
