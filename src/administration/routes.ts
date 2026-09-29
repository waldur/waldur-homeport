import { UIView } from '@uirouter/react';

import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { isFeatureVisible } from '@/features/connect';
import {
  InvitationsFeatures,
  MarketplaceFeatures,
  ProjectFeatures,
  ResellerFeatures,
  SupportFeatures,
  SramFeatures,
  UserFeatures,
} from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { getMarketplaceTitle } from '@/marketplace/title';
import { isSramUiEnabled } from '@/sram/utils';
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
    redirectTo: 'admin-workers',
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
    redirectTo: 'admin-branding',
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
    redirectTo: 'admin-ai-assistant-settings',
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
    redirectTo: 'admin-classifiers',
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
    redirectTo: 'admin-marketplace-offerings',
    data: {
      breadcrumb: () => getMarketplaceTitle(),
    },
  },

  {
    name: 'admin-changelog',
    url: 'changelog/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./changelog/ChangelogPage').then((module) => ({
        default: module.ChangelogPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Changelog'),
      permissions: [isStaffOrSupport],
    },
  },

  // Now the Service profiles tab of the roles page; kept as a redirect so
  // bookmarks, the chaos route sweep and external links keep resolving. See
  // admin-role-availabilities for why `skipBreadcrumb` is needed.
  {
    name: 'admin-marketplace-offering-profiles',
    url: 'offering-profiles/',
    parent: 'admin-configuration',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: {
      state: 'admin-roles',
      params: { tab: 'profiles' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },
  // Folded into the roles page as a tab; kept as a redirect so bookmarks, the
  // chaos route sweep and external links keep resolving. ui-router inherits
  // `data` from the parent, so without `skipBreadcrumb` this state picks up
  // admin-configuration's "Configuration" breadcrumb and `filterState` in
  // src/navigation/useTabs.tsx lists it in the header menu under that name.
  {
    name: 'admin-role-availabilities',
    url: 'role-availabilities/',
    parent: 'admin-configuration',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: { state: 'admin-roles', params: { tab: 'availability' } },
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'admin-marketplace-offering-profile-detail',
    url: 'offering-profiles/:uuid/',
    // Service profiles are a tab of the roles page, so their detail page sits in
    // the same menu; the URL is unchanged because both parents are url-less.
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('@/marketplace/offerings/profiles/OfferingProfileDetail').then(
        (module) => ({
          default: module.OfferingProfileDetail,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Service profile'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-workers',
    url: 'workers/?tab',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./system-management/WorkersPage').then((module) => ({
        default: module.WorkersPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Workers & messaging'),
    },
  },

  {
    name: 'admin-database',
    url: 'database/?tab',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./system-management/DatabasePage').then((module) => ({
        default: module.DatabasePage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Database'),
    },
  },

  {
    name: 'admin-logging-telemetry',
    url: 'logging-telemetry/?tab',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./system-management/LoggingTelemetryPage').then((module) => ({
        default: module.LoggingTelemetryPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Logging & telemetry'),
    },
  },

  // Folded into a tabbed System management page; kept as a redirect so
  // bookmarks, the chaos route sweep and external links keep resolving. See
  // admin-role-availabilities for why `skipBreadcrumb` is needed.
  {
    name: 'admin-celery-info',
    url: 'celery-info/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: { state: 'admin-workers', params: { tab: 'celery' } },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-rabbitmq',
    url: 'rabbitmq/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: { state: 'admin-workers', params: { tab: 'rabbitmq' } },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-pubsub-health',
    url: 'pubsub-health/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: { state: 'admin-workers', params: { tab: 'pubsub' } },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-event-subscriptions',
    url: 'event-subscriptions/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: {
      state: 'admin-workers',
      params: { tab: 'event-subscriptions' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-system-info',
    url: 'system-info/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: { state: 'admin-database', params: { tab: 'statistics' } },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-table-growth',
    url: 'table-growth/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: { state: 'admin-database', params: { tab: 'table-growth' } },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-table-growth-settings',
    url: 'table-growth-settings/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: { state: 'admin-database', params: { tab: 'settings' } },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-system-logging-settings',
    url: 'system-logging/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: {
      state: 'admin-logging-telemetry',
      params: { tab: 'system-logging' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-telemetry-settings',
    url: 'telemetry/',
    parent: 'admin-system-management',
    component: UIView,
    redirectTo: {
      state: 'admin-logging-telemetry',
      params: { tab: 'telemetry' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-email-health',
    url: 'email/',
    parent: 'admin-system-management',
    component: lazyComponent(() =>
      import('./email/EmailHealthPage').then((module) => ({
        default: module.EmailHealthPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Email configuration'),
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
    url: 'service-desk-settings/?tab',
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
      permissions: [hasSupport],
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
      permissions: [isStaff, hasSupport],
    },
  },

  {
    name: 'admin-marketplace-settings',
    url: 'marketplace/?tab&q',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('./marketplace/AdministrationMarketplace').then((module) => ({
        default: module.AdministrationMarketplace,
      })),
    ),
    data: {
      breadcrumb: () => translate('Settings'),
      priority: 80,
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
    name: 'admin-organization-credits-cost-policies',
    url: 'credits-cost-policies/?tab',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations-compliance/CreditsCostPoliciesPage').then(
        (module) => ({
          default: module.CreditsCostPoliciesPage,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Credits & cost policies'),
      permissions: [isStaff],
    },
  },

  {
    name: 'admin-organization-project-settings',
    url: 'organization-project-settings/?tab',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations-compliance/OrganizationProjectSettingsPage').then(
        (module) => ({
          default: module.OrganizationProjectSettingsPage,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Organization & project settings'),
    },
  },

  {
    name: 'admin-classifiers',
    url: 'classifiers/?tab',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations-compliance/ClassifiersPage').then((module) => ({
        default: module.ClassifiersPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Classifiers'),
    },
  },

  {
    name: 'admin-compliance',
    url: 'compliance/?tab',
    parent: 'admin-organizations-compliance',
    component: lazyComponent(() =>
      import('./organizations-compliance/CompliancePage').then((module) => ({
        default: module.CompliancePage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Compliance'),
    },
  },

  // Folded into a tabbed Organizations & compliance page; kept as a redirect
  // so bookmarks, the chaos route sweep and external links keep resolving. See
  // admin-role-availabilities for why `skipBreadcrumb` is needed.
  {
    name: 'admin-organization-credit-management',
    url: 'organization-credits/',
    parent: 'admin-organizations-compliance',
    component: UIView,
    redirectTo: {
      state: 'admin-organization-credits-cost-policies',
      params: { tab: 'credits' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-organization-cost-policies',
    url: 'organization-cost-policies/',
    parent: 'admin-organizations-compliance',
    component: UIView,
    redirectTo: {
      state: 'admin-organization-credits-cost-policies',
      params: { tab: 'cost-policies' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-onboarding-settings',
    url: 'onboarding-settings/',
    parent: 'admin-organizations-compliance',
    component: UIView,
    redirectTo: {
      state: 'admin-organization-project-settings',
      params: { tab: 'onboarding' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-project-settings',
    url: 'project-settings/',
    parent: 'admin-organizations-compliance',
    component: UIView,
    redirectTo: {
      state: 'admin-organization-project-settings',
      params: { tab: 'project' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-organizations-group-list',
    url: 'organization-groups/',
    parent: 'admin-organizations-compliance',
    component: UIView,
    redirectTo: {
      state: 'admin-classifiers',
      params: { tab: 'organization-groups' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-affiliated-organizations',
    url: 'affiliated-organizations/',
    parent: 'admin-organizations-compliance',
    component: UIView,
    redirectTo: { state: 'admin-classifiers', params: { tab: 'affiliations' } },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-science-domains',
    url: 'science-domains/',
    parent: 'admin-organizations-compliance',
    component: UIView,
    redirectTo: {
      state: 'admin-classifiers',
      params: { tab: 'science-domains' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-user-agreements',
    url: 'user-agreements/',
    parent: 'admin-organizations-compliance',
    component: UIView,
    redirectTo: {
      state: 'admin-compliance',
      params: { tab: 'user-agreements' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  // A marketplace-resource feature, so it sits in the Marketplace menu; the
  // URL is unchanged because both menu parents are url-less.
  {
    name: 'admin-user-lexis-links-list',
    url: 'lexis-links/',
    component: lazyComponent(() =>
      import('@/marketplace/resources/lexis/BasicLexisLinkList').then(
        (module) => ({ default: module.BasicLexisLinkList }),
      ),
    ),
    parent: 'admin-marketplace',
    data: {
      breadcrumb: () => translate('LEXIS links'),
      priority: 95,
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

  // Moved to Support › User management, next to robot accounts and offering
  // users; kept as a redirect so bookmarks and external links keep resolving.
  {
    name: 'admin-course-accounts',
    url: 'course-accounts/?tab',
    parent: 'admin-organizations-compliance',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: 'support-course-accounts',
    data: {
      skipBreadcrumb: true,
    },
  },

  // Folded into a tabbed Marketplace page; kept as a redirect so bookmarks,
  // the chaos route sweep and external links keep resolving. See
  // admin-role-availabilities for why `skipBreadcrumb` is needed.
  {
    name: 'admin-marketplace-category-groups',
    url: 'category-groups',
    parent: 'admin-marketplace',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: {
      state: 'admin-marketplace-categories',
      params: { tab: 'category-groups' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-marketplace-categories',
    url: 'categories/?tab',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('./marketplace/CatalogueStructurePage').then((module) => ({
        default: module.CatalogueStructurePage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Catalogue structure'),
      priority: 40,
    },
  },

  {
    name: 'admin-marketplace-tags',
    url: 'tags/',
    parent: 'admin-marketplace',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: {
      state: 'admin-marketplace-categories',
      params: { tab: 'tags' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-marketplace-offering-groups',
    url: 'offering-groups/',
    parent: 'admin-marketplace',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: {
      state: 'admin-marketplace-offerings',
      params: { tab: 'groups' },
    },
    data: {
      skipBreadcrumb: true,
    },
  },

  {
    name: 'admin-marketplace-posix-id-pools',
    url: 'posix-id-pools/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('@/marketplace/service-providers/posix-id-pools/ProviderPosixIdPoolsList').then(
        (module) => ({
          default: module.AdminPosixIdPoolsList,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('POSIX ID pools'),
      priority: 21,
      feature: MarketplaceFeatures.show_posix_id_pools,
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
      priority: 70,
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
      priority: 90,
    },
  },

  {
    name: 'admin-slurm-policy-settings',
    url: 'slurm-policy/',
    parent: 'admin-marketplace',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: {
      state: 'admin-marketplace-settings',
      params: { tab: 'slurm-policy' },
    },
    data: {
      skipBreadcrumb: true,
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
    url: 'roles/?tab',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./roles/RolesPage').then((module) => ({
        default: module.RolesPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Roles'),
    },
  },

  // See admin-role-availabilities above: a tab of the roles page now, kept as a
  // redirect only. The staff gate moved onto the tab itself.
  {
    name: 'admin-role-hygiene',
    url: 'role-hygiene/',
    parent: 'admin-configuration',
    // Never rendered: the redirect fires first. `component` is required by the
    // local StateDeclaration type.
    component: UIView,
    redirectTo: { state: 'admin-roles', params: { tab: 'hygiene' } },
    data: {
      skipBreadcrumb: true,
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
    name: 'admin-sram-integration',
    url: 'sram-integration/?tab',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('./sram/SramIntegrationPage').then((module) => ({
        default: module.SramIntegrationPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('SRAM integration'),
      feature: SramFeatures.integration,
      // The SRAM API is staff-only and answers 404 while the integration is
      // off, so the page follows both.
      permissions: [isStaff, () => isSramUiEnabled()],
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
    name: 'admin-matrix-chat',
    url: 'matrix-chat/?tab',
    parent: 'admin-configuration',
    component: lazyComponent(() =>
      import('@/matrix/MatrixAdminDashboard').then((module) => ({
        default: module.MatrixAdminDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Matrix chat'),
      permissions: [isStaffOrSupport],
      feature: ProjectFeatures.show_matrix_chat,
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
