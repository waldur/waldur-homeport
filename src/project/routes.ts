import { StateDeclaration } from '@waldur/core/types';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { ProjectDashboardContainer } from './ProjectDashboardContainer';
import { ProjectEventsView } from './ProjectEventsList';
import { ProjectIssuesList } from './ProjectIssuesList';
import { ProjectWorkspace } from './ProjectWorkspace';
import { loadProject } from './resolve';
import { ProjectTeam } from './team/ProjectTeam';

export const states: StateDeclaration[] = [
  {
    name: 'project',
    url: '/projects/:uuid/',
    abstract: true,
    component: ProjectWorkspace,
    data: {
      auth: true,
      workspace: PROJECT_WORKSPACE,
    },
    resolve: {
      project: loadProject,
    },
  },

  {
    name: 'project.details',
    url: '',
    component: ProjectDashboardContainer,
    data: {
      pageClass: 'gray-bg',
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'project.issues',
    url: 'issues/',
    component: ProjectIssuesList,
    data: {
      feature: 'support',
      pageClass: 'gray-bg',
    },
  },

  {
    name: 'project.events',
    url: 'events/',
    component: ProjectEventsView,
  },

  {
    name: 'project.team',
    url: 'team/',
    component: ProjectTeam,
  },
];
