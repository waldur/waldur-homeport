import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Panel } from '@waldur/core/Panel';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { translate } from '@waldur/i18n';
import { ComplianceChecklists } from '@waldur/marketplace-checklist/ComplianceChecklists';
import { useTitle } from '@waldur/navigation/title';
import { Project, PROJECT_WORKSPACE, User } from '@waldur/workspace/types';

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
      <div style={{ paddingLeft: 10 }}>
        <Row>
          <Col md={8}>
            <ProjectCounters project={props.project} />
          </Col>
          <Col md={4}>
            <ProjectActions {...props} />
          </Col>
        </Row>
        <ComplianceChecklists />
        <Panel title={translate('Resources')}>
          <ProjectResourcesList />
        </Panel>
        <CategoryResourcesList
          scopeType={PROJECT_WORKSPACE}
          scope={props.project}
        />
      </div>
    </>
  );
};
