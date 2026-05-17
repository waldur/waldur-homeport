import { UIView } from '@uirouter/react';

import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { isFeatureVisible } from '@/features/connect';
import {
  MarketplaceFeatures,
  ProjectFeatures,
  InvitationsFeatures,
} from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { getProject, isStaffOrSupport } from '@/workspace/selectors';

import { loadProject } from './resolve';

export const states: StateDeclaration[] = [
  {
    name: 'project',
    url: '/projects/:uuid/?include_terminated',
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
    data: {},
  },
  {
    name: 'project-manage',
    url: 'manage/?tab&section',
    parent: 'project-manage-container',
    params: {
      tab: { dynamic: true },
      section: { dynamic: true },
    },
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
      breadcrumb: () => translate('Support'),
      skipBreadcrumb: true,
      permissions: [hasSupport],
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
      permissions: [
        (state) =>
          !isFeatureVisible(
            MarketplaceFeatures.conceal_audit_log_from_end_users,
          ) || isStaffOrSupport(state),
      ],
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
  {
    name: 'project-course-accounts',
    url: 'course-accounts/',
    component: lazyComponent(() =>
      import('./course-accounts/ProjectCourseAccountsList').then((module) => ({
        default: module.ProjectCourseAccountsList,
      })),
    ),
    parent: 'project-team',
    data: {
      skipBreadcrumb: true,
      breadcrumb: () => translate('Course accounts'),
      feature: InvitationsFeatures.show_course_accounts,
      permissions: [
        (state) => {
          const project = getProject(state);
          if (isFeatureVisible(InvitationsFeatures.show_course_accounts)) {
            return project.kind === 'course';
          }
          return false;
        },
      ],
    },
  },
  {
    name: 'project-permissions-reviews',
    url: 'permissions-reviews/',
    component: lazyComponent(() =>
      import('./team/ProjectPermissionsReviewsList').then((module) => ({
        default: module.ProjectPermissionsReviewsList,
      })),
    ),
    parent: 'project-team',
    data: {
      skipBreadcrumb: true,
      breadcrumb: () => translate('Permissions reviews'),
      feature: ProjectFeatures.show_permission_reviews,
    },
  },
];
