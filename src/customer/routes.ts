import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures, MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import { hasSupport } from '@waldur/issues/hooks';
import { OrganizationUIView } from '@waldur/organization/OrganizationUIView';
import { getConfig } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { isOwnerOrStaff, isStaff } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { CustomerManageContainer } from './details/CustomerManageContainer';
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
const CustomerOrdersList = lazyComponent(
  () => import('./orders/CustomerOrdersList'),
  'CustomerOrdersList',
);
const CustomerChecklistOverview = lazyComponent(
  () => import('../marketplace-checklist/CustomerChecklistOverview'),
  'CustomerChecklistOverview',
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
      priority: 110,
    },
  },
  {
    name: 'organization-orders',
    parent: 'organization',
    url: 'marketplace-orders/',
    component: CustomerOrdersList,
    data: {
      breadcrumb: () => translate('Orders'),
      priority: 120,
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
      priority: 130,
    },
  },

  {
    name: 'organization.dashboard',
    url: 'dashboard/',
    component: CustomerDashboard,
    data: {
      breadcrumb: () => translate('Organization dashboard'),
      priority: 100,
    },
  },

  {
    name: 'organization.events',
    url: 'events/',
    component: CustomerEventsList,
    data: {
      breadcrumb: () => translate('Audit logs'),
      priority: 180,
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
      permissions: [isOwnerOrStaff],
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
      permissions: [
        (state: RootState) =>
          !getConfig(state).plugins.WALDUR_CORE.INVITATION_USE_WEBHOOKS,
      ],
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
    name: 'organization-manage-container',
    url: '',
    abstract: true,
    parent: 'organization',
    component: CustomerManageContainer,
  },
  {
    name: 'organization-manage',
    url: 'manage/?tab',
    component: CustomerManage,
    parent: 'organization-manage-container',
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'organization-billing',
    abstract: true,
    parent: 'organization',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Accounting'),
      priority: 140,
      permissions: [isOwnerOrStaff],
    },
  },

  {
    name: 'organization-payment-profiles',
    url: 'payment-profiles/',
    parent: 'organization-billing',
    component: PaymentProfilesPanel,
    data: {
      breadcrumb: () => translate('Payment profiles'),
      permissions: [
        (state) => {
          if (isFeatureVisible(CustomerFeatures.payments_for_staff_only)) {
            return isStaff(state);
          }
          return true;
        },
      ],
    },
  },

  {
    name: 'organization-payment-list',
    url: 'payments/',
    parent: 'organization-billing',
    component: CustomerPayments,
    data: {
      breadcrumb: () => translate('Payments list'),
      permissions: [
        (state) => {
          if (isFeatureVisible(CustomerFeatures.payments_for_staff_only)) {
            if (!isStaff(state)) {
              return false;
            }
          }
          if (!state.workspace.customer) {
            return true;
          }
          const activePaymentProfile = getActivePaymentProfile(
            state.workspace.customer.payment_profiles,
          );
          return !!activePaymentProfile;
        },
      ],
    },
  },

  {
    name: 'organization-cost-policies',
    url: 'cost-policies/',
    parent: 'organization-billing',
    component: CostPoliciesList,
    data: {
      breadcrumb: () => translate('Cost policies'),
      permissions: [isOwnerOrStaff],
      priority: 135,
    },
  },

  {
    name: 'organization.checklists',
    url: 'checklists/',
    component: CustomerChecklistOverview,
    data: {
      breadcrumb: () => translate('Checklists'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
      priority: 130,
    },
  },
];
