import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { Panel } from '@waldur/core/Panel';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { translate } from '@waldur/i18n';
import { ComplianceChecklists } from '@waldur/marketplace-checklist/ComplianceChecklists';
import { User, Project } from '@waldur/workspace/types';

import { ProjectActions } from './ProjectActions';
import { ProjectCounters } from './ProjectCounters';
import { ProjectResourcesList } from './ProjectResourcesList';

interface ProjectDashboardProps {
  user: User;
  project: Project;
  canAddUser: boolean;
  marketplaceChecklistEnabled: boolean;
}

export const ProjectDashboard = (props: ProjectDashboardProps) =>
  props.project ? (
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
        {props.marketplaceChecklistEnabled && (
          <Panel title={translate('Compliance checklists')}>
            <ComplianceChecklists />
          </Panel>
        )}
        <Panel title={translate('Resources')}>
          <ProjectResourcesList />
        </Panel>
        <CategoryResourcesList scopeType="project" scope={props.project} />
      </div>
    </>
  ) : null;
