import { UIView } from '@uirouter/react';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isStaff, isStaffOrSupport } from '@waldur/workspace/selectors';

import { hasSupport } from './hooks';

export const states: StateDeclaration[] = [
  {
    name: 'support',
    url: '/support/',
    parent: 'layout',
    component: UIView,
    abstract: true,
    data: {
      auth: true,
      title: () => translate('Support'),
      permissions: [isStaffOrSupport],
    },
  },

  {
    name: 'support-user-management',
    parent: 'support',
    component: UIView,
    abstract: true,
    url: '',
    data: {
      breadcrumb: () => translate('User management'),
    },
  },

  {
    name: 'support-communication',
    parent: 'support',
    component: UIView,
    abstract: true,
    url: '',
    data: {
      breadcrumb: () => translate('Communication'),
    },
  },

  {
    name: 'support-customer-support',
    parent: 'support',
    component: UIView,
    abstract: true,
    url: '',
    data: {
      breadcrumb: () => translate('Customer support'),
    },
  },

  {
    name: 'support-logs',
    parent: 'support',
    component: UIView,
    abstract: true,
    url: '',
    data: {
      breadcrumb: () => translate('Logs'),
    },
  },

  {
    name: 'support-dashboard',
    url: '',
    parent: 'support',
    component: lazyComponent(() =>
      import('@waldur/support/dashboard/SupportDashboard').then((module) => ({
        default: module.SupportDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 1,
    },
  },

  {
    name: 'support.detail',
    url: 'issue/:issue_uuid/',
    component: lazyComponent(() =>
      import('./IssueDetails').then((module) => ({
        default: module.IssueDetails,
      })),
    ),
    data: {
      permissions: [hasSupport],
      hideHeaderMenu: true,
    },
  },

  {
    name: 'supportFeedback',
    url: '/support/feedback/?token&evaluation',
    component: lazyComponent(() =>
      import('@waldur/issues/feedback/SupportFeedback').then((module) => ({
        default: module.SupportFeedback,
      })),
    ),
    data: {
      permissions: [hasSupport],
    },
  },

  {
    name: 'support-list',
    url: 'list/?{status}',
    parent: 'support-communication',
    component: lazyComponent(() =>
      import('@waldur/issues/SupportIssues').then((module) => ({
        default: module.SupportIssues,
      })),
    ),
    data: {
      breadcrumb: () => translate('Support requests'),
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'support-broadcast',
    url: 'broadcast/',
    parent: 'support-communication',
    component: lazyComponent(() =>
      import('../broadcasts/BroadcastList').then((module) => ({
        default: module.BroadcastList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Broadcast'),
    },
  },

  {
    name: 'support-maintenance',
    url: 'maintenance/',
    parent: 'support-communication',
    component: lazyComponent(() =>
      import('../maintenance/MaintenanceList').then((module) => ({
        default: module.MaintenanceList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Maintenance'),
    },
  },

  {
    name: 'support-audit-logs',
    url: 'audit-logs/',
    parent: 'support-logs',
    component: lazyComponent(() =>
      import('@waldur/support/SupportEventsList').then((module) => ({
        default: module.SupportEventsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit logs'),
    },
  },
  {
    name: 'support-email-logs',
    url: 'email-logs/',
    parent: 'support-logs',
    component: lazyComponent(() =>
      import('@waldur/support/SupportEmailLogsList').then((module) => ({
        default: module.SupportEmailLogsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Outgoing emails'),
    },
  },
  {
    name: 'support-data-access-logs',
    url: 'data-access-logs/',
    parent: 'support-logs',
    component: lazyComponent(() =>
      import('@waldur/support/SupportDataAccessLogsList').then((module) => ({
        default: module.SupportDataAccessLogsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Data access logs'),
      permissions: [isStaffOrSupport],
    },
  },
  {
    name: 'support-system-logs',
    url: 'system-logs/',
    parent: 'support-logs',
    component: lazyComponent(() =>
      import('@waldur/support/SupportSystemLogsList').then((module) => ({
        default: module.SupportSystemLogsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('System logs'),
      permissions: [isStaffOrSupport],
    },
  },
  {
    name: 'support-ai-assistant-logs',
    url: 'ai-assistant-logs/',
    parent: 'support-logs',
    component: lazyComponent(() =>
      import('@waldur/support/SupportAIAssistantLogsList').then((module) => ({
        default: module.SupportAIAssistantLogsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('AI assistant logs'),
      feature: SupportFeatures.enable_llm_assistant,
    },
  },

  // User Management routes moved from Administration
  {
    name: 'support-users',
    url: 'users/?role',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@waldur/user/support/UserList').then((module) => ({
        default: module.UserList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Users'),
    },
  },

  {
    name: 'support-user-manage-container',
    url: '',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@waldur/user/UserManageContainer').then((module) => ({
        default: module.UserManageContainer,
      })),
    ),
    abstract: true,
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'support-user-manage',
    url: 'users/:user_uuid/?tab',
    parent: 'support-user-manage-container',
    component: lazyComponent(() =>
      import('@waldur/user/UserManage').then((module) => ({
        default: module.UserManage,
      })),
    ),
  },

  {
    name: 'support-active-sessions',
    url: 'users/active-sessions/',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@waldur/administration/TokensList').then((module) => ({
        default: module.TokensList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Active sessions'),
    },
  },

  {
    name: 'support-freeipa-users',
    url: 'freeipa-users/',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@waldur/administration/users/FreeIPAUsersList').then(
        (module) => ({
          default: module.FreeIPAUsersList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('FreeIPA users'),
      permissions: [() => ENV.plugins.WALDUR_CORE.FREEIPA_ENABLED],
    },
  },

  {
    name: 'support-robot-accounts',
    url: 'robot-accounts/',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@waldur/marketplace/robot-accounts/ProviderRobotAccountList').then(
        (module) => ({
          default: module.ProviderRobotAccountList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Robot accounts'),
    },
  },

  {
    name: 'support-offering-users',
    url: 'offering-users/',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@waldur/administration/users/OfferingUsersList').then(
        (module) => ({
          default: module.OfferingUsersList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Offering users'),
    },
  },

  {
    name: 'support-invitations',
    url: 'invitations/',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@waldur/administration/InvitationList').then((module) => ({
        default: module.InvitationList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Invitations'),
    },
  },

  {
    name: 'support-notification-messages',
    url: 'notification-messages/',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@waldur/administration/notifications/NotificationList').then(
        (module) => ({
          default: module.NotificationList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Notifications'),
    },
  },

  // Communication
  {
    name: 'support-announcements',
    url: 'announcements/',
    parent: 'support-communication',
    component: lazyComponent(() =>
      import('@waldur/administration/announcements/AnnouncementsList').then(
        (module) => ({
          default: module.AnnouncementsList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Announcements'),
    },
  },

  // Customer Support
  {
    name: 'support-onboarding',
    url: 'onboarding/?tab',
    parent: 'support-customer-support',
    component: lazyComponent(() =>
      import('@waldur/administration/organizations/OrganizationOnboardingTabs').then(
        (module) => ({
          default: module.OrganizationOnboardingTabs,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Onboarding'),
      permissions: [isStaff],
    },
  },
  {
    name: 'support-onboarding-justification-details',
    url: 'onboarding/justifications/:uuid/',
    parent: 'support-customer-support',
    component: lazyComponent(() =>
      import('@waldur/administration/organizations/OnboardingJustificationDetailsPage').then(
        (module) => ({
          default: module.OnboardingJustificationDetailsPage,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Justification details'),
      skipBreadcrumb: true,
      permissions: [isStaff],
    },
  },
  {
    name: 'support-organization-requests',
    url: 'organization-requests/',
    parent: 'support-customer-support',
    component: lazyComponent(() =>
      import('@waldur/administration/organizations/requests/OrganizationRequestsList').then(
        (module) => ({
          default: module.OrganizationRequestsList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Organization requests'),
      permissions: [isStaff],
    },
  },

  {
    name: 'support-organization-credits',
    url: 'organization-credits/',
    parent: 'support-customer-support',
    component: lazyComponent(() =>
      import('@waldur/administration/organizations/OrganizationCreditsList').then(
        (module) => ({
          default: module.OrganizationCreditsList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Credit management'),
      permissions: [isStaff],
    },
  },

  {
    name: 'support-invoices',
    url: 'invoices/',
    parent: 'support-customer-support',
    component: lazyComponent(() =>
      import('@waldur/support/invoices').then((module) => ({
        default: module.SupportInvoiceItemsContainer,
      })),
    ),
    data: {
      breadcrumb: () => translate('Invoice items'),
    },
  },
];
