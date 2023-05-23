import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { isStaff, isStaffOrSupport } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { fetchCustomer } from './workspace/CustomerWorkspace';

const ProjectsList = lazyComponent(
  () => import('@waldur/project/ProjectsList'),
  'ProjectsList',
);
const ProjectCreateRequestsList = lazyComponent(
  () => import('@waldur/marketplace-flows/ProjectCreateRequestsList'),
  'ProjectCreateRequestsList',
);
const ResourceCreateRequestsList = lazyComponent(
  () => import('@waldur/marketplace-flows/ResourceCreateRequestsList'),
  'ResourceCreateRequestsList',
);
const ProjectCreateContainer = lazyComponent(
  () => import('../project/ProjectCreateContainer'),
  'ProjectCreateContainer',
);
const CustomerDashboard = lazyComponent(
  () => import('./dashboard/CustomerDashboard'),
  'CustomerDashboard',
);
const CustomerManage = lazyComponent(
  () => import('./details/CustomerManage'),
  'CustomerManage',
);
const PaymentProfilesPanel = lazyComponent(
  () => import('./payment-profiles/PaymentProfilesPanel'),
  'PaymentProfilesPanel',
);
const CustomerPayments = lazyComponent(
  () => import('./details/CustomerPayments'),
  'CustomerPayments',
);
const CustomerUsersTab = lazyComponent(
  () => import('./team/CustomerUsersTab'),
  'CustomerUsersTab',
);
const InvitationsList = lazyComponent(
  () => import('../invitations/InvitationsList'),
  'InvitationsList',
);
const GroupInvitationsList = lazyComponent(
  () => import('../invitations/GroupInvitationsList'),
  'GroupInvitationsList',
);
const CustomerPermissionsLogList = lazyComponent(
  () => import('./team/CustomerPermissionsLogList'),
  'CustomerPermissionsLogList',
);
const CustomerPermissionsReviewList = lazyComponent(
  () => import('./team/CustomerPermissionsReviewList'),
  'CustomerPermissionsReviewList',
);

const CustomerEventsList = lazyComponent(
  () => import('./workspace/CustomerEventsList'),
  'CustomerEventsList',
);
const CustomerIssuesList = lazyComponent(
  () => import('./workspace/CustomerIssuesList'),
  'CustomerIssuesList',
);

const IssueDetailsContainer = lazyComponent(
  () => import('../issues/IssueDetails'),
  'IssueDetails',
);

export const states: StateDeclaration[] = [
  {
    name: 'organization',
    url: '/organizations/:uuid/',
    abstract: true,
    data: {
      auth: true,
      workspace: ORGANIZATION_WORKSPACE,
      title: () => translate('Organization'),
      hideProjectSelector: true,
    },
    parent: 'layout',
    component: UIView,
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
    ],
  },

  {
    name: 'reporting',
    url: '/reporting/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Reporting'),
      permissions: [isStaffOrSupport],
      hideProjectSelector: true,
    },
  },

  {
    name: 'organization-requests',
    abstract: true,
    parent: 'organization',
    component: UIView,
    data: {
      breadcrumb: () => translate('Requests'),
    },
  },

  {
    name: 'organization-team',
    abstract: true,
    parent: 'organization',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Team'),
    },
  },

  {
    name: 'organization.dashboard',
    url: 'dashboard/',
    component: CustomerDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },

  {
    name: 'organization.events',
    url: 'events/',
    component: CustomerEventsList,
    data: {
      breadcrumb: () => translate('Audit logs'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'organization.issues',
    url: 'issues/',
    component: CustomerIssuesList,
    data: {
      breadcrumb: () => translate('Issues'),
      skipBreadcrumb: true,
      permissions: [hasSupport],
    },
  },

  {
    name: 'organization.issue-details',
    url: 'issue/:issue_uuid/',
    component: IssueDetailsContainer,
    data: {
      permissions: [hasSupport],
    },
  },

  {
    name: 'organization.projects',
    url: 'projects/',
    component: ProjectsList,
    data: {
      breadcrumb: () => translate('Projects'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'organization-project-requests',
    url: 'project-requests/',
    component: ProjectCreateRequestsList,
    parent: 'organization-requests',
    data: {
      breadcrumb: () => translate('Project creation requests'),
    },
  },

  {
    name: 'organization-resource-requests',
    url: 'resource-requests/',
    component: ResourceCreateRequestsList,
    parent: 'organization-requests',
    data: {
      breadcrumb: () => translate('Resource creation requests'),
    },
  },

  {
    name: 'organization-users',
    url: 'users/',
    component: CustomerUsersTab,
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Users'),
    },
  },

  {
    name: 'organization-invitations',
    url: 'invitations/',
    component: InvitationsList,
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Invitations'),
    },
  },

  {
    name: 'organization-group-invitations',
    url: 'group-invitations/',
    component: GroupInvitationsList,
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Group invitations'),
    },
  },

  {
    name: 'organization-permissions-log',
    url: 'permissions-log/',
    component: CustomerPermissionsLogList,
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Permission log'),
    },
  },

  {
    name: 'organization-permissions-reviews',
    url: 'permissions-reviews/',
    component: CustomerPermissionsReviewList,
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Reviews'),
    },
  },

  {
    name: 'organization.manage',
    url: 'manage/',
    component: CustomerManage,
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'organization-payments',
    abstract: true,
    parent: 'organization',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Payments'),
      permissions: [
        (state) => {
          if (isFeatureVisible('customer.payments_for_staff_only')) {
            return isStaff(state);
          }
          return true;
        },
      ],
    },
  },

  {
    name: 'organization-payment-profiles',
    url: 'payment-profiles/',
    parent: 'organization-payments',
    component: PaymentProfilesPanel,
    data: {
      breadcrumb: () => translate('Payment profiles'),
    },
  },

  {
    name: 'organization-payment-list',
    url: 'payments/',
    parent: 'organization-payments',
    component: CustomerPayments,
    data: {
      breadcrumb: () => translate('Payments list'),
    },
  },

  {
    name: 'organization.createProject',
    url: 'createProject/',
    component: ProjectCreateContainer,
  },
];
