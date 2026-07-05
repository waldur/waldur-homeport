import { UIView } from '@uirouter/react';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { ResellerFeatures, SupportFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { isStaff, isStaffOrSupport } from '@/workspace/selectors';

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
      import('@/support/dashboard/SupportDashboard').then((module) => ({
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
      import('@/issues/feedback/SupportFeedback').then((module) => ({
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
      import('@/issues/SupportIssues').then((module) => ({
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
      import('../maintenance/StaffMaintenanceList').then((module) => ({
        default: module.StaffMaintenanceList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Maintenance announcements'),
    },
  },

  {
    name: 'support-audit-logs',
    url: 'audit-logs/',
    parent: 'support-logs',
    component: lazyComponent(() =>
      import('@/support/SupportEventsList').then((module) => ({
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
      import('@/support/SupportEmailLogsList').then((module) => ({
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
      import('@/support/SupportDataAccessLogsList').then((module) => ({
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
      import('@/support/SupportSystemLogsList').then((module) => ({
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
      import('@/support/SupportAIAssistantLogsList').then((module) => ({
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
      import('@/user/support/UserList').then((module) => ({
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
      import('@/user/UserManageContainer').then((module) => ({
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
      import('@/user/UserManage').then((module) => ({
        default: module.UserManage,
      })),
    ),
    params: {
      section: {
        dynamic: true,
      },
    },
  },

  {
    name: 'support-active-sessions',
    url: 'users/active-sessions/',
    parent: 'support-user-management',
    component: lazyComponent(() =>
      import('@/administration/TokensList').then((module) => ({
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
      import('@/administration/users/FreeIPAUsersList').then((module) => ({
        default: module.FreeIPAUsersList,
      })),
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
      import('@/marketplace/robot-accounts/ProviderRobotAccountList').then(
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
      import('@/administration/users/OfferingUsersList').then((module) => ({
        default: module.OfferingUsersList,
      })),
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
      import('@/administration/InvitationList').then((module) => ({
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
      import('@/administration/notifications/NotificationList').then(
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
      import('@/administration/announcements/AnnouncementsList').then(
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
      import('@/administration/organizations/OrganizationOnboardingTabs').then(
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
      import('@/administration/organizations/OnboardingJustificationDetailsPage').then(
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
      import('@/administration/organizations/requests/OrganizationRequestsList').then(
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
      import('@/administration/organizations/OrganizationCreditsList').then(
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
    name: 'support-affiliates',
    url: 'affiliates/',
    parent: 'support-customer-support',
    component: lazyComponent(() =>
      import('@/administration/affiliates/AffiliateLinksList').then(
        (module) => ({
          default: module.AffiliateLinksList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Affiliate program'),
      feature: ResellerFeatures.affiliates,
      permissions: [
        isStaff,
        () => Boolean(ENV.plugins.WALDUR_CORE?.AFFILIATES_ENABLED),
      ],
    },
  },

  {
    name: 'support-invoices',
    url: 'invoices/',
    parent: 'support-customer-support',
    component: lazyComponent(() =>
      import('@/support/invoices').then((module) => ({
        default: module.SupportInvoiceItemsContainer,
      })),
    ),
    data: {
      breadcrumb: () => translate('Invoice items'),
    },
  },
];
