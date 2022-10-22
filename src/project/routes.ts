import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { canAccessInvitations } from '@waldur/invitations/selectors';
import { hasSupport } from '@waldur/issues/hooks';
import store from '@waldur/store/store';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { loadProject } from './resolve';

const ProjectDashboard = lazyComponent(
  () => import(/* webpackChunkName: "ProjectDashboard" */ './ProjectDashboard'),
  'ProjectDashboard',
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
const InvitationsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "team/InvitationsList" */ './team/InvitationsList'
    ),
  'InvitationsList',
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
      title: () =>
        [
          getCustomer(store.getState()).name,
          getProject(store.getState()).name,
        ].join(' > '),
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
    name: 'project-team',
    abstract: true,
    parent: 'project',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Team'),
    },
  },

  {
    name: 'project.dashboard',
    url: '',
    component: ProjectDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },

  {
    name: 'project.manage',
    url: 'manage/',
    component: ProjectManage,
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'project.issues',
    url: 'issues/',
    component: ProjectIssuesList,
    data: {
      breadcrumb: () => translate('Issues'),
      skipBreadcrumb: true,
      permissions: [hasSupport],
    },
  },

  {
    name: 'project.events',
    url: 'events/',
    component: ProjectEventsView,
    data: {
      breadcrumb: () => translate('Audit logs'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'project-users',
    url: 'users/',
    component: ProjectUsersList,
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Users'),
    },
  },
  {
    name: 'project-invitations',
    url: 'invitations/',
    component: InvitationsList,
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Invitations'),
      permissions: [canAccessInvitations],
    },
  },
  {
    name: 'project-permissions-log',
    url: 'permissions-log/',
    component: ProjectPermissionsLogList,
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Permissions log'),
    },
  },
];
