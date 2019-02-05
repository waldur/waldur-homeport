import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { loadCategories } from '@waldur/dashboard/api';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { translate } from '@waldur/i18n';
import { User, Project } from '@waldur/workspace/types';

import { ProjectActions } from './ProjectActions';
import { ProjectCounters } from './ProjectCounters';

interface ProjectDashboardProps {
  user: User;
  project: Project;
}

export const ProjectDashboard = (props: ProjectDashboardProps) => props.project ? (
  <>
    <DashboardHeader
      title={translate('Welcome, {user}!', {user: props.user.full_name})}
      subtitle={translate('Overview of {project} project', {project: props.project.name})}
    />
    <div style={{paddingLeft: 10}}>
      <Row>
        <Col md={8}>
          <ProjectCounters project={props.project}/>
        </Col>
        <Col md={4}>
          <ProjectActions project={props.project}/>
        </Col>
      </Row>
      <CategoryResourcesList
        loader={(project: Project) => loadCategories('project', project)}
        scope={props.project}
      />
    </div>
  </>
) : null;
