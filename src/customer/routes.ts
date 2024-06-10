import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import { hasSupport } from '@waldur/issues/hooks';
import { OrganizationUIView } from '@waldur/organization/OrganizationUIView';
import { isOwnerOrStaff, isStaff } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { fetchCustomer } from './workspace/CustomerWorkspace';

const ProjectsList = lazyComponent(
  () => import('@waldur/project/ProjectsList'),
  'ProjectsList',
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

const CostPoliciesList = lazyComponent(
  () => import('./cost-policies/CostPoliciesList'),
  'CostPoliciesList',
);
const OrganizationResourcesAllList = lazyComponent(
  () => import('../marketplace/resources/list/OrganizationResourcesAllList'),
  'OrganizationResourcesAllList',
);

export const states: StateDeclaration[] = [
  {
    name: 'organization',
    url: '/organizations/:uuid/',
    abstract: true,
    data: {
      auth: true,
      workspace: WorkspaceType.ORGANIZATION,
      title: () => translate('Organization'),
      skipInitWorkspace: true,
    },
    parent: 'layout',
    component: OrganizationUIView,
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
    ],
  },

  {
    name: 'organization-resources',
    parent: 'organization',
    url: 'marketplace-resources/',
    component: OrganizationResourcesAllList,
    data: {
      breadcrumb: () => translate('Resources'),
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
      permissions: [isOwnerOrStaff],
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
      permissions: [isOwnerOrStaff],
    },
  },

  {
    name: 'organization-permissions-log',
    url: 'permissions-log/',
    component: CustomerPermissionsLogList,
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Permission log'),
      permissions: [isOwnerOrStaff],
    },
  },

  {
    name: 'organization-permissions-reviews',
    url: 'permissions-reviews/',
    component: CustomerPermissionsReviewList,
    parent: 'organization-team',
    data: {
      breadcrumb: () => translate('Reviews'),
      permissions: [isOwnerOrStaff],
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
          if (isFeatureVisible(CustomerFeatures.payments_for_staff_only)) {
            return isStaff(state);
          }
          return isOwnerOrStaff(state);
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
      permissions: [
        (state) => {
          const activePaymentProfile = getActivePaymentProfile(
            state.workspace.customer.payment_profiles,
          );
          return !!activePaymentProfile;
        },
      ],
    },
  },

  {
    name: 'organization.cost-policies',
    url: 'cost-policies/',
    component: CostPoliciesList,
    data: {
      breadcrumb: () => translate('Cost policies'),
      permissions: [isOwnerOrStaff],
    },
  },
];
