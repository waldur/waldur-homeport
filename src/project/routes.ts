import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { withStore } from '@waldur/store/connect';

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
    component: withStore(ProjectWorkspace),
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
    component: withStore(ProjectDashboardContainer),
    data: {
      pageTitle: gettext('Dashboard'),
      pageClass: 'gray-bg',
      hideBreadcrumbs: true,
    },
  },

  {
    name: 'project.issues',
    url: 'issues/',
    component: withStore(ProjectIssuesList),
    data: {
      feature: 'support',
      pageTitle: gettext('Issues'),
      pageClass: 'gray-bg',
    },
  },

  {
    name: 'project.events',
    url: 'events/',
    component: withStore(ProjectEventsView),
    data: {
      pageTitle: gettext('Audit logs'),
    },
  },

  {
    name: 'project.team',
    url: 'team/',
    component: withStore(ProjectTeam),
    data: {
      pageTitle: gettext('Team'),
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
