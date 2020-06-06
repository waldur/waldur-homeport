import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';

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
      workspace: 'project',
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
      pageTitle: gettext('Dashboard'),
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
      pageTitle: gettext('Issues'),
      pageClass: 'gray-bg',
    },
  },

  {
    name: 'project.events',
    url: 'events/',
    component: ProjectEventsView,
    data: {
      pageTitle: gettext('Audit logs'),
    },
  },

  {
    name: 'project.team',
    url: 'team/',
    component: ProjectTeam,
    data: {
      pageTitle: gettext('Team'),
    },
  },
];
