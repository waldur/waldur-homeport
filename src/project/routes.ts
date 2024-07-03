import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { WorkspaceType } from '@waldur/workspace/types';

import { ProjectContainer } from './ProjectContainer';
import { ProjectManageContainer } from './ProjectManageContainer';
import { loadProject } from './resolve';

const ProjectDashboard = lazyComponent(
  () => import('./ProjectDashboard'),
  'ProjectDashboard',
);
const ProjectManage = lazyComponent(
  () => import('./ProjectManage'),
  'ProjectManage',
);
const ProjectResourcesPage = lazyComponent(
  () => import('./ProjectResourcesPage'),
  'ProjectResourcesPage',
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

const IssueDetailsContainer = lazyComponent(
  () => import('../issues/IssueDetails'),
  'IssueDetails',
);

export const states: StateDeclaration[] = [
  {
    name: 'project',
    url: '/projects/:uuid/',
    abstract: true,
    parent: 'layout',
    component: ProjectContainer,
    data: {
      auth: true,
      workspace: WorkspaceType.PROJECT,
      title: () => translate('Project'),
      skipInitWorkspace: true,
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
      skipInitWorkspace: true,
      priority: 120,
    },
  },

  {
    name: 'project.dashboard',
    url: '',
    component: ProjectDashboard,
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
    component: ProjectManageContainer,
  },
  {
    name: 'project-manage',
    url: 'manage/?tab',
    parent: 'project-manage-container',
    component: ProjectManage,
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'project.resources',
    url: 'resources/',
    component: ProjectResourcesPage,
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 110,
    },
  },

  {
    name: 'project.issues',
    url: 'issues/',
    component: ProjectIssuesList,
    data: {
      breadcrumb: () => translate('Issues'),
      permissions: [hasSupport],
      priority: 140,
    },
  },
  {
    name: 'project.issue-details',
    url: 'issue/:issue_uuid/',
    component: IssueDetailsContainer,
    data: {
      permissions: [hasSupport],
    },
  },

  {
    name: 'project.events',
    url: 'events/',
    component: ProjectEventsView,
    data: {
      breadcrumb: () => translate('Audit logs'),
      priority: 130,
    },
  },
  {
    name: 'project-users',
    url: 'users/',
    component: ProjectUsersList,
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Users'),
      skipInitWorkspace: true,
    },
  },
  {
    name: 'project-invitations',
    url: 'invitations/',
    component: InvitationsList,
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Invitations'),
      skipInitWorkspace: true,
    },
  },
  {
    name: 'project-permissions-log',
    url: 'permissions-log/',
    component: ProjectPermissionsLogList,
    parent: 'project-team',
    data: {
      breadcrumb: () => translate('Permissions log'),
      skipInitWorkspace: true,
    },
  },
];
