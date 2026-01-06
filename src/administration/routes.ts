import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  CustomerFeatures,
  InvitationsFeatures,
  MarketplaceFeatures,
  SupportFeatures,
} from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { isStaff, isStaffOrSupport } from '@waldur/workspace/selectors';

export const states: StateDeclaration[] = [
  {
    name: 'admin',
    url: '/administration/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Administration'),
      permissions: [isStaffOrSupport],
      workspace: 'admin',
    },
  },

  {
    name: 'admin.dashboard',
    url: '',
    component: lazyComponent(() =>
      import('./dashboard/AdministrationDashboard').then((module) => ({
        default: module.AdministrationDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 1,
    },
  },
  // Original 8-category navigation structure
  {
    name: 'admin-system-management',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('System management'),
    },
  },

  {
    name: 'admin-user-interface',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('User interface'),
    },
  },

  {
    name: 'admin-configuration',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Configuration'),
    },
  },

  {
    name: 'admin-organizations-compliance',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Organizations & compliance'),
    },
  },

  {
    name: 'admin-marketplace',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Marketplace'),
    },
  },

  {
    name: 'admin-system-info',
    url: 'system-info/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./SystemInfoPage').then((module) => ({
        default: module.SystemInfoPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('System info'),
    },
  },

  {
    name: 'admin-celery-info',
    url: 'celery-info/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./CeleryInfoPage').then((module) => ({
        default: module.CeleryInfoPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Celery info'),
    },
  },

  {
    name: 'admin-quick-shortcuts',
    url: 'quick-shortcuts/',
    parent: 'admin-user-interface',
    component: lazyComponent(() =>
      import('./quick-shortcuts/QuickShortcutsList').then((module) => ({
        default: module.QuickShortcutsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Navigation shortcuts'),
    },
  },

  {
    name: 'admin-branding',
    url: 'branding/?tab&q',
    parent: 'admin-user-interface',
    component: lazyComponent(() =>
      import('./settings/AdministrationBranding').then((module) => ({
        default: module.AdministrationBranding,
      })),
    ),
    data: {
      breadcrumb: () => translate('Branding'),
    },
  },

  {
    name: 'admin-languages',
    url: 'languages/',
    parent: 'admin-user-interface',
    component: lazyComponent(() =>
      import('./languages/AdministrationLanguages').then((module) => ({
        default: module.AdministrationLanguages,
      })),
    ),
    data: {
      breadcrumb: () => translate('Languages'),
    },
  },

  {
    name: 'admin-service-desk-settings',
    url: 'service-desk-settings/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./service-desk/AdministrationServiceDesk').then((module) => ({
        default: module.AdministrationServiceDesk,
      })),
    ),
    data: {
      breadcrumb: () => translate('Service desk settings'),
    },
  },

  {
    name: 'admin-issue-templates',
    url: 'issue-templates/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./service-desk/issue-templates/AdministrationIssueTemplatesList').then(
        (module) => ({
          default: module.AdministrationIssueTemplatesList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Issue templates'),
    },
  },

  {
    name: 'admin-request-types',
    url: 'request-types/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./service-desk/request-types/RequestTypesList').then(
        (module) => ({
          default: module.RequestTypesList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Request types'),
      permissions: [isStaff],
    },
  },

  {
    name: 'admin-marketplace-settings',
    url: 'marketplace/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('./marketplace/AdministrationMarketplace').then((module) => ({
        default: module.AdministrationMarketplace,
      })),
    ),
    data: {
      breadcrumb: () => translate('Marketplace'),
    },
  },

  {
    name: 'admin-telemetry-settings',
    url: 'telemetry/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./telemetry/AdministrationTelemetry').then((module) => ({
        default: module.AdministrationTelemetry,
      })),
    ),
    data: {
      breadcrumb: () => translate('Telemetry'),
    },
  },
  {
    name: 'admin-custom-scripts-settings',
    url: 'custom-scripts/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./custom-scripts/AdministrationCustomScripts').then((module) => ({
        default: module.AdministrationCustomScripts,
      })),
    ),
    data: {
      breadcrumb: () => translate('Custom scripts'),
    },
  },

  {
    name: 'admin-features',
    url: 'features/?tab&q',
    parent: 'admin-user-interface',
    component: lazyComponent(() =>
      import('./FeaturesList').then((module) => ({
        default: module.FeaturesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Features'),
    },
  },

  {
    name: 'admin-user-agreements',
    url: 'user-agreements/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./agreements/UserAgreementsList').then((module) => ({
        default: module.UserAgreementsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('User agreements'),
    },
  },

  {
    name: 'admin-user-lexis-links-list',
    url: 'lexis-links/',
    component: lazyComponent(() =>
      import('@waldur/marketplace/resources/lexis/BasicLexisLinkList').then(
        (module) => ({ default: module.BasicLexisLinkList }),
      ),
    ),
    parent: 'admin-organizations-compliance',
    data: {
      breadcrumb: () => translate('LEXIS links'),
      permissions: [
        () => {
          if (isFeatureVisible(MarketplaceFeatures.lexis_links)) {
            return true;
          }
        },
      ],
    },
  },

  {
    name: 'admin-service-accounts',
    url: 'service-accounts/?tab',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./service-accounts/ServiceAccountsTable').then((module) => ({
        default: module.ServiceAccountsTable,
      })),
    ),
    data: {
      breadcrumb: () => translate('Service accounts'),
      feature: InvitationsFeatures.show_service_accounts,
    },
  },

  {
    name: 'admin-course-accounts',
    url: 'course-accounts/?tab',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./CourseAccountsTable').then((module) => ({
        default: module.CourseAccountsTable,
      })),
    ),
    data: {
      breadcrumb: () => translate('Course accounts'),
      feature: InvitationsFeatures.show_course_accounts,
    },
  },

  {
    name: 'admin-marketplace-category-groups',
    url: 'category-groups',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('@waldur/marketplace/category/admin/CategoryGroupsList').then(
        (module) => ({ default: module.CategoryGroupsList }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Category groups'),
    },
  },

  {
    name: 'admin-marketplace-categories',
    url: 'categories/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('@waldur/marketplace/category/admin/AdminCategoriesPage').then(
        (module) => ({ default: module.AdminCategoriesPage }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Categories'),
    },
  },

  {
    name: 'admin-marketplace-remote-sync',
    url: 'remote-offering-sync/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('./remote-offering-sync/RemoteOfferingSyncList').then(
        (module) => ({ default: module.RemoteOfferingSyncList }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Remote offering sync'),
    },
  },

  {
    name: 'admin-organizations-group-list',
    url: 'organization-groups/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations/OrganizationGroupsList').then((module) => ({
        default: module.OrganizationGroupsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Organization groups'),
    },
  },
  {
    name: 'admin-organization-cost-policies',
    url: 'organization-cost-policies/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations/OrganizationCostPoliciesList').then((module) => ({
        default: module.OrganizationCostPoliciesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Cost policies'),
      permissions: [isStaff],
    },
  },

  {
    name: 'admin-identity',
    url: 'identity/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./providers/IdentityProvidersList').then((module) => ({
        default: module.IdentityProvidersList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Identity providers'),
    },
  },

  {
    name: 'admin-roles',
    url: 'roles/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./roles/RolesList').then((module) => ({
        default: module.RolesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('User roles'),
    },
  },

  {
    name: 'admin-auto-provisioning-rules',
    url: 'auto-provisioning-rules/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./auto-provisioning-rules/RulesList').then((module) => ({
        default: module.RulesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Auto-provisioning rules'),
    },
  },

  {
    name: 'admin-ai-assistant-settings',
    url: 'ai-assistant-settings/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./ai-assistant/AIAssistantSettings').then((module) => ({
        default: module.AIAssistantSettings,
      })),
    ),
    data: {
      breadcrumb: () => translate('AI Assistant settings'),
      feature: SupportFeatures.enable_llm_assistant,
    },
  },

  {
    name: 'admin-onboarding-settings',
    url: 'onboarding-settings/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations/OnboardingSettings').then((module) => ({
        default: module.OnboardingSettings,
      })),
    ),
    data: {
      breadcrumb: () => translate('Onboarding settings'),
      feature: CustomerFeatures.show_onboarding,
    },
  },

  {
    name: 'admin-organization-credit-management',
    url: 'organization-credits/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations/OrganizationCreditsList').then((module) => ({
        default: module.OrganizationCreditsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Credit management'),
      permissions: [isStaff],
    },
  },

  {
    name: 'admin-broadcast-templates',
    url: 'broadcast-templates/',
    parent: 'admin-user-interface',
    component: lazyComponent(() =>
      import('../broadcasts/BroadcastTemplateList').then((module) => ({
        default: module.BroadcastTemplateList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Broadcast templates'),
    },
  },

  {
    name: 'admin-support-feedback',
    url: 'support-feedback/',
    parent: 'admin-user-interface',
    component: lazyComponent(() =>
      import('@waldur/issues/feedback/SupportFeedbackList').then((module) => ({
        default: module.SupportFeedbackList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Support feedback'),
      permissions: [isStaffOrSupport, hasSupport],
    },
  },
];
