import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

import { loadProject } from './resolve';

export const states: StateDeclaration[] = [
  {
    name: 'project',
    url: '/projects/:uuid/',
    abstract: true,
    parent: 'layout',
    component: lazyComponent(() =>
      import('./ProjectContainer').then((module) => ({
        default: module.ProjectContainer,
      })),
    ),
    data: {
      auth: true,
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
    redirectTo: 'project-users',
    data: {
      breadcrumb: () => translate('Team'),
      priority: 120,
    },
  },

  {
    name: 'project.dashboard',
    url: '',
    component: lazyComponent(() =>
      import('./ProjectDashboard').then((module) => ({
        default: module.ProjectDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Project dashboard'),
      priority: 100,
    },
  },

  {
    name: 'project-manage-container',
    url: '',
    abstract: true,
    parent: 'project',
    component: lazyComponent(() =>
      import('./ProjectManageContainer').then((module) => ({
        default: module.ProjectManageContainer,
      })),
    ),
  },
  {
    name: 'project-manage',
    url: 'manage/?tab',
    parent: 'project-manage-container',
    component: lazyComponent(() =>
      import('./ProjectManage').then((module) => ({
        default: module.ProjectManage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'project.resources',
    url: 'resources/',
    component: lazyComponent(() =>
      import('./ProjectResourcesPage').then((module) => ({
        default: module.ProjectResourcesPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 110,
    },
  },

  {
    name: 'project.issues',
    url: 'issues/',
    component: lazyComponent(() =>
      import('./ProjectIssuesList').then((module) => ({
        default: module.ProjectIssuesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Requests'),
      permissions: [hasSupport],
      priority: 140,
    },
  },

  {
    name: 'project.events',
    url: 'events/',
    component: lazyComponent(() =>
      import('./ProjectEventsList').then((module) => ({
        default: module.ProjectEventsView,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit logs'),
      priority: 130,
    },
  },
  {
    name: 'project-users',
    url: 'users/',
    component: lazyComponent(() =>
      import('./team/ProjectUsersList').then((module) => ({
        default: module.ProjectUsersList,
      })),
    ),
    parent: 'project-team',
    data: {
      skipBreadcrumb: true,
      breadcrumb: () => translate('Users'),
    },
  },
  {
    name: 'project-invitations',
    url: 'invitations/',
    component: lazyComponent(() =>
      import('./team/InvitationsList').then((module) => ({
        default: module.InvitationsList,
      })),
    ),
    parent: 'project-team',
    data: {
      skipBreadcrumb: true,
      breadcrumb: () => translate('Invitations'),
    },
  },
  {
    name: 'project-service-accounts',
    url: 'service-accounts/',
    component: lazyComponent(() =>
      import('./team/ProjectServiceAccountsList').then((module) => ({
        default: module.ProjectServiceAccountsList,
      })),
    ),
    parent: 'project-team',
    data: {
      skipBreadcrumb: true,
      breadcrumb: () => translate('Service accounts'),
      feature: InvitationsFeatures.show_service_accounts,
    },
  },
];
