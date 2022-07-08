import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { CustomerBookingManagement } from '@waldur/customer/dashboard/CustomerBookingManagement';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { translate } from '@waldur/i18n';
import { ComplianceChecklists } from '@waldur/marketplace-checklist/ComplianceChecklists';
import { useBreadcrumbs } from '@waldur/navigation/breadcrumbs/store';
import { useTitle } from '@waldur/navigation/title';
import { ProjectResourcesFilter } from '@waldur/project/ProjectResourcesFilter';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { Project, PROJECT_WORKSPACE, User } from '@waldur/workspace/types';

import { useProjectItems } from '../navigation/navitems';

import { ProjectActions } from './ProjectActions';
import { ProjectCounters } from './ProjectCounters';
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
  useBreadcrumbs([{ label: translate('Project') }]);
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
      <DashboardHeader
        title={translate('Welcome, {user}!', { user: props.user.full_name })}
        subtitle={translate('Overview of {project} project', {
          project: props.project.name,
        })}
      />
      <Row>
        <Col md={8}>
          {!shouldConcealPrices && <ProjectCounters project={props.project} />}
        </Col>
        <Col md={4}>
          <ProjectActions {...props} />
        </Col>
      </Row>
      <ComplianceChecklists />
      <CustomerBookingManagement />
      <Panel title={translate('Resources')}>
        <ProjectResourcesList filters={<ProjectResourcesFilter />} />
      </Panel>
      <CategoryResourcesList
        scopeType={PROJECT_WORKSPACE}
        scope={props.project}
      />
    </>
  );
};
