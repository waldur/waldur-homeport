import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { canAccessInvitations } from '@waldur/invitations/selectors';
import { hasSupport } from '@waldur/issues/hooks';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { loadProject } from './resolve';

const ProjectDashboard = lazyComponent(
  () => import('./ProjectDashboard'),
  'ProjectDashboard',
);
const ProjectManage = lazyComponent(
  () => import('./ProjectManage'),
  'ProjectManage',
);
const ProjectEventsView = lazyComponent(
  () => import('./ProjectEventsList'),
  'ProjectEventsView',
);
const ProjectIssuesList = lazyComponent(
  () => import('./ProjectIssuesList'),
  'ProjectIssuesList',
);
const ProjectUsersList = lazyComponent(
  () => import('./team/ProjectUsersList'),
  'ProjectUsersList',
);
const InvitationsList = lazyComponent(
  () => import('./team/InvitationsList'),
  'InvitationsList',
);
const ProjectPermissionsLogList = lazyComponent(
  () => import('./team/ProjectPermissionsLogList'),
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
      title: () => translate('Project'),
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
