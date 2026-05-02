import { UIView } from '@uirouter/react';

import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { isFeatureVisible } from '@/features/connect';
import {
  CustomerFeatures,
  InvitationsFeatures,
  MarketplaceFeatures,
  ResellerFeatures,
  SupportFeatures,
  UserFeatures,
} from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { isStaff, isStaffOrSupport } from '@/workspace/selectors';

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
    name: 'admin-table-growth',
    url: 'table-growth/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./table-growth/TableGrowthPage').then((module) => ({
        default: module.TableGrowthPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Table growth'),
    },
  },

  {
    name: 'admin-marketplace-offering-profiles',
    url: 'offering-profiles/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('@/marketplace/offerings/profiles/OfferingProfilesList').then(
        (module) => ({
          default: module.OfferingProfilesList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Service profiles'),
    },
  },
  {
    name: 'admin-role-availabilities',
    url: 'role-availabilities/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./role-availabilities/RoleAvailabilitiesList').then((module) => ({
        default: module.RoleAvailabilitiesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Role availabilities'),
    },
  },
  {
    name: 'admin-marketplace-offering-profile-detail',
    url: 'offering-profiles/:uuid/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('@/marketplace/offerings/profiles/OfferingProfileDetail').then(
        (module) => ({
          default: module.OfferingProfileDetail,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Service profile'),
    },
  },

  {
    name: 'admin-table-growth-settings',
    url: 'table-growth-settings/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./table-growth/AdministrationTableGrowthSettings').then(
        (module) => ({
          default: module.AdministrationTableGrowthSettings,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Table growth settings'),
    },
  },

  {
    name: 'admin-system-info',
    url: 'system-info/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./database-stats/DatabaseStatsPage').then((module) => ({
        default: module.DatabaseStatsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Database statistics'),
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
    name: 'admin-rabbitmq',
    url: 'rabbitmq/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./rabbitmq/RabbitMQPage').then((module) => ({
        default: module.RabbitMQPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('RabbitMQ'),
      permissions: [isStaffOrSupport],
    },
  },

  {
    name: 'admin-pubsub-health',
    url: 'pubsub-health/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./pubsub/PubSubHealthPage').then((module) => ({
        default: module.PubSubHealthPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('PubSub health'),
      permissions: [isStaff],
    },
  },

  {
    name: 'admin-site-agents',
    url: 'site-agents/?tab',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./site-agents/SiteAgentManagement').then((module) => ({
        default: module.SiteAgentManagement,
      })),
    ),
    data: {
      breadcrumb: () => translate('Site agents'),
      permissions: [isStaffOrSupport],
    },
  },

  {
    name: 'admin-event-subscriptions',
    url: 'event-subscriptions/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./event-subscriptions/EventSubscriptionsList').then((module) => ({
        default: module.EventSubscriptionsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Event subscriptions'),
      permissions: [isStaffOrSupport],
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
      breadcrumb: () => translate('Settings'),
    },
  },

  {
    name: 'admin-system-logging-settings',
    url: 'system-logging/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./system-logging/AdministrationSystemLogging').then((module) => ({
        default: module.AdministrationSystemLogging,
      })),
    ),
    data: {
      breadcrumb: () => translate('System logging'),
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
      import('@/marketplace/resources/lexis/BasicLexisLinkList').then(
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
      import('@/marketplace/category/admin/CategoryGroupsList').then(
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
      import('@/marketplace/category/admin/AdminCategoriesPage').then(
        (module) => ({ default: module.AdminCategoriesPage }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Categories'),
    },
  },

  {
    name: 'admin-marketplace-tags',
    url: 'tags/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('@/marketplace/tags/admin/TagsList').then((module) => ({
        default: module.TagsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Tags'),
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
    name: 'admin-software-catalog-settings',
    url: 'software-catalog/?tab',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('./marketplace/AdministrationSoftwareCatalog').then((module) => ({
        default: module.AdministrationSoftwareCatalog,
      })),
    ),
    data: {
      breadcrumb: () => translate('Software catalog'),
      feature: MarketplaceFeatures.display_software_catalog,
    },
  },

  {
    name: 'admin-slurm-policy-settings',
    url: 'slurm-policy/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('./marketplace/AdministrationSlurmPolicy').then((module) => ({
        default: module.AdministrationSlurmPolicy,
      })),
    ),
    data: {
      breadcrumb: () => translate('SLURM policy'),
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
    name: 'admin-affiliated-organizations',
    url: 'affiliated-organizations/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./affiliated-organizations/AffiliatedOrganizationsList').then(
        (module) => ({
          default: module.AffiliatedOrganizationsList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Affiliated organizations'),
    },
  },
  {
    name: 'admin-science-domains',
    url: 'science-domains/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./science-domains/ScienceDomainsList').then((module) => ({
        default: module.ScienceDomainsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Science domains'),
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
    url: 'identity/?tab',
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
    name: 'admin-user-actions-settings',
    url: 'user-actions-settings/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./user-actions/AdministrationUserActions').then((module) => ({
        default: module.AdministrationUserActions,
      })),
    ),
    data: {
      breadcrumb: () => translate('User actions'),
      feature: UserFeatures.pending_user_actions,
    },
  },

  {
    name: 'admin-ssh-keys-settings',
    url: 'ssh-keys-settings/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./ssh-keys/AdministrationSshKeys').then((module) => ({
        default: module.AdministrationSshKeys,
      })),
    ),
    data: {
      breadcrumb: () => translate('SSH key settings'),
      feature: UserFeatures.ssh_keys,
    },
  },

  {
    name: 'admin-personal-access-tokens-settings',
    url: 'personal-access-tokens-settings/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./personal-access-tokens/AdministrationPersonalAccessTokens').then(
        (module) => ({
          default: module.AdministrationPersonalAccessTokens,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Personal access tokens'),
    },
  },

  {
    name: 'admin-reporting-settings',
    url: 'reporting-settings/',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./reporting/AdministrationReporting').then((module) => ({
        default: module.AdministrationReporting,
      })),
    ),
    data: {
      breadcrumb: () => translate('Reporting settings'),
    },
  },

  {
    name: 'admin-call-management-settings',
    url: 'call-management-settings/?tab&q',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./call-management/AdministrationCallManagement').then(
        (module) => ({
          default: module.AdministrationCallManagement,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Call management'),
      feature: MarketplaceFeatures.show_call_management_functionality,
    },
  },

  {
    name: 'admin-arrow',
    url: 'arrow/?tab',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./arrow/ArrowDashboard').then((module) => ({
        default: module.ArrowDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Arrow Integration'),
      permissions: [isStaff],
      feature: ResellerFeatures.arrow,
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
    name: 'admin-project-settings',
    url: 'project-settings/',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations/AdministrationProject').then((module) => ({
        default: module.AdministrationProject,
      })),
    ),
    data: {
      breadcrumb: () => translate('Project settings'),
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
      import('@/issues/feedback/SupportFeedbackList').then((module) => ({
        default: module.SupportFeedbackList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Support feedback'),
      permissions: [isStaffOrSupport, hasSupport],
    },
  },
];
