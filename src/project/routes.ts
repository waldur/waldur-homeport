import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { loadProject } from './resolve';

const ProjectDashboardContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectDashboardContainer" */ './ProjectDashboardContainer'
    ),
  'ProjectDashboardContainer',
);
const ProjectManage = lazyComponent(
  () => import(/* webpackChunkName: "ProjectManage" */ './ProjectManage'),
  'ProjectManage',
);
const ProjectEventsView = lazyComponent(
  () =>
    import(/* webpackChunkName: "ProjectEventsList" */ './ProjectEventsList'),
  'ProjectEventsView',
);
const ProjectIssuesList = lazyComponent(
  () =>
    import(/* webpackChunkName: "ProjectIssuesList" */ './ProjectIssuesList'),
  'ProjectIssuesList',
);
const ProjectUsersList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "team/ProjectUsersList" */ './team/ProjectUsersList'
    ),
  'ProjectUsersList',
);
const ProjectPermissionsLogList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "team/ProjectPermissionsLogList" */ './team/ProjectPermissionsLogList'
    ),
  'ProjectPermissionsLogList',
);

export const states: StateDeclaration[] = [
  {
    name: 'project',
    url: '/projects/:uuid/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      auth: true,
      workspace: PROJECT_WORKSPACE,
    },
    resolve: [
      {
        token: 'project',
        deps: ['$transition$'],
        resolveFn: loadProject,
      },
    ],
  },

  {
    name: 'project.details',
    url: '',
    component: ProjectDashboardContainer,
  },

  {
    name: 'project.manage',
    url: 'manage/',
    component: ProjectManage,
  },

  {
    name: 'project.issues',
    url: 'issues/',
    component: ProjectIssuesList,
  },

  {
    name: 'project.events',
    url: 'events/',
    component: ProjectEventsView,
  },
  {
    name: 'project.users',
    url: 'users/',
    component: ProjectUsersList,
  },
  {
    name: 'project.permissions-log',
    url: 'permissions-log/',
    component: ProjectPermissionsLogList,
  },
];
